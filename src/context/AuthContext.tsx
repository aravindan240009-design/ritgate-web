import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { setLogoutHandler, verifyOTP, sendOTP, wakeUpBackend } from '../services/api.service';
import type { User, UserRole, SessionData } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  deviceId: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBackendReady: boolean;
  login: (user: User, role: UserRole, token?: string) => void;
  logout: () => void;
  sendOTPRequest: (userId: string, role: UserRole) => Promise<{ success: boolean; message: string; email?: string }>;
  verifyOTPRequest: (userId: string, otp: string, role: UserRole) => Promise<{ success: boolean; message: string; user?: User }>;
  getUserId: () => string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const navigate = useNavigate();
  const deviceId = storage.getDeviceId();

  // ── Auto-login on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const session = storage.getSession();
    if (session?.user && session?.role) {
      setUser(session.user);
      setRole(session.role);
    }
    setIsLoading(false);
  }, []);

  // ── Wake backend ────────────────────────────────────────────────────────
  useEffect(() => {
    wakeUpBackend().then((ok) => setIsBackendReady(ok));
  }, []);

  // ── Register 401 logout handler ────────────────────────────────────────
  useEffect(() => {
    setLogoutHandler(() => {
      setUser(null);
      setRole(null);
      storage.clearAll();
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  const login = useCallback((u: User, r: UserRole, token?: string) => {
    setUser(u);
    setRole(r);
    const session: SessionData = { token: token || '', user: u, role: r, deviceId };
    storage.setSession(session);
  }, [deviceId]);

  const logout = useCallback(() => {
    setUser(null);
    setRole(null);
    storage.clearAll();
    navigate('/login', { replace: true });
  }, [navigate]);

  const sendOTPRequest = useCallback(async (userId: string, r: UserRole) => {
    return sendOTP(userId, r);
  }, []);

  const verifyOTPRequest = useCallback(async (userId: string, otp: string, r: UserRole) => {
    const result = await verifyOTP(userId, otp, r);
    if (result.success && result.user) {
      login(result.user, r, result.token);
    }
    return result;
  }, [login]);

  const getUserId = useCallback((): string => {
    if (!user || !role) return '';
    switch (role) {
      case 'STUDENT': return (user as any).regNo || '';
      case 'STAFF':
      case 'NON_TEACHING':
      case 'NON_CLASS_INCHARGE':
      case 'ADMIN_OFFICER': return (user as any).staffCode || '';
      case 'HOD': return (user as any).hodCode || '';
      case 'HR': return (user as any).hrCode || '';
      case 'SECURITY': return (user as any).securityId || '';
      default: return '';
    }
  }, [user, role]);

  return (
    <AuthContext.Provider value={{
      user, role, deviceId, isAuthenticated: !!user && !!role,
      isLoading, isBackendReady, login, logout,
      sendOTPRequest, verifyOTPRequest, getUserId,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
