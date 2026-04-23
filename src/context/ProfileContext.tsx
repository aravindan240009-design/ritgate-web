import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface ProfileContextType {
  profileImage: string | null;
  captureImage: () => Promise<void>;
  clearProfileImage: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const storageKey = (userId: string | null) =>
  userId ? `profile_image_${userId}` : 'profile_image_guest';

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getUserId } = useAuth();
  const userId = getUserId();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey(userId));
    setProfileImage(saved);
  }, [userId]);

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
          setProfileImage(base64);
          localStorage.setItem(storageKey(userId), base64);
          resolve();
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      };
      
      input.click();
    });
  }, [userId]);

  const clearProfileImage = useCallback(async () => {
    setProfileImage(null);
    localStorage.removeItem(storageKey(userId));
  }, [userId]);

  return (
    <ProfileContext.Provider value={{ profileImage, captureImage, clearProfileImage }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
};
