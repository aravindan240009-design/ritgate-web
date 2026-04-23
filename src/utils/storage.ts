import { STORAGE_KEYS } from '../config/api.config';
import type { SessionData } from '../types';

export const storage = {
  getSession(): SessionData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setSession(data: SessionData): void {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(data));
  },

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getDeviceId(): string {
    let id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!id) {
      id = crypto.randomUUID?.() || generateUUID();
      localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
    }
    return id;
  },

  getTheme(): 'light' | 'dark' | null {
    return localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | null;
  },

  setTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  getShownNotifIds(): Set<number> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SHOWN_NOTIF_IDS);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  },

  addShownNotifId(id: number): void {
    const ids = this.getShownNotifIds();
    ids.add(id);
    // Keep only last 500
    const arr = [...ids].slice(-500);
    localStorage.setItem(STORAGE_KEYS.SHOWN_NOTIF_IDS, JSON.stringify(arr));
  },

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.SHOWN_NOTIF_IDS);
    // Keep deviceId and theme on logout
  },
};

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
