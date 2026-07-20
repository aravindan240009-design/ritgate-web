import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getProfilePhoto } from '../services/api.service';

interface ProfileContextType {
  /** Locally captured photo if the user set one, otherwise their institutional photo. */
  profileImage: string | null;
  /** True when `profileImage` is a device-local override rather than the server photo. */
  hasLocalOverride: boolean;
  captureImage: () => Promise<void>;
  clearProfileImage: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const storageKey = (userId: string | null) =>
  userId ? `profile_image_${userId}` : 'profile_image_guest';

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getUserId } = useAuth();
  const userId = getUserId();
  // Device-local photo the user picked themselves. Kept separate from the
  // institutional photo so signing in on a fresh device still shows a face.
  const [localImage, setLocalImage] = useState<string | null>(null);
  // The institutional photo. Login carries no photo field at all — the only
  // source is GET /api/profile-photo/{code}, resolved separately per user.
  const [serverImage, setServerImage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey(userId));
    setLocalImage(saved);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setServerImage(null);
      return;
    }
    let cancelled = false;
    getProfilePhoto(userId).then(url => {
      if (!cancelled) setServerImage(url);
    });
    return () => { cancelled = true; };
  }, [userId]);

  // A local capture is an explicit user choice, so it wins over the server photo.
  const profileImage = localImage ?? serverImage;

  const captureImage = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) {
          resolve();
          return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          setLocalImage(base64);
          localStorage.setItem(storageKey(userId), base64);
          resolve();
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      };
      
      input.click();
    });
  }, [userId]);

  // Clearing removes the local override only — the institutional photo reappears
  // underneath it rather than dropping the user back to initials.
  const clearProfileImage = useCallback(async () => {
    setLocalImage(null);
    localStorage.removeItem(storageKey(userId));
  }, [userId]);

  return (
    <ProfileContext.Provider
      value={{ profileImage, hasLocalOverride: !!localImage, captureImage, clearProfileImage }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
};
