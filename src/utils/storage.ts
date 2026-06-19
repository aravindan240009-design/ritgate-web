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

  getDismissedNotifIds(scope: string): Set<number> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DISMISSED_NOTIF_IDS);
      const all = raw ? JSON.parse(raw) : {};
      return new Set(all[scope] || []);
    } catch {
      return new Set();
    }
  },

  addDismissedNotifIds(scope: string, ids: number[]): void {
    if (ids.length === 0) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DISMISSED_NOTIF_IDS);
      const all = raw ? JSON.parse(raw) : {};
      const existing = new Set<number>(all[scope] || []);
      ids.forEach((id) => existing.add(id));
      all[scope] = [...existing].slice(-500);
      localStorage.setItem(STORAGE_KEYS.DISMISSED_NOTIF_IDS, JSON.stringify(all));
    } catch {
      // Ignore storage failures; server read state still handles the fallback.
    }
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
