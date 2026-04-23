/**
 * NotificationService.ts (Web)
 * 
 * Web-compatible notification service using Browser Notification API.
 * Ported for parity with mobile/src/services/NotificationService.ts
 */

class NotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  async displayNotification(title: string, body: string, data?: any) {
    if (this.permission !== 'granted') {
      const ok = await this.requestPermission();
      if (!ok) return;
    }

    const options: NotificationOptions = {
      body,
      icon: '/favicon.ico', // Should be the app icon
      badge: '/badge-icon.png',
      data: data || {},
      tag: 'ritgate-update',
    };

    const notification = new Notification(title, options);

    notification.onclick = (event) => {
      event.preventDefault(); // prevent the browser from focusing the Notification's tab
      window.focus();
      // Handle navigation logic here if needed
      notification.close();
    };
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }
}

export const notificationService = new NotificationService();
