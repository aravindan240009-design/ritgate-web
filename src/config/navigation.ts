import {
  Home,
  History,
  User,
  Car,
  Users,
  Plus,
  BookOpen,
  ScanLine,
  Clock,
  LogOut,
  FileSpreadsheet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

export function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'STUDENT':
      return [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/requests', label: 'Requests', icon: Clock },
        { path: '/history', label: 'History', icon: History },
        { path: '/profile', label: 'Profile', icon: User },
      ];
    case 'STAFF':
      return [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/new-pass', label: 'New Pass', icon: Plus },
        { path: '/event-csv', label: 'Events', icon: FileSpreadsheet },
        { path: '/my-requests', label: 'My Requests', icon: Clock },
        { path: '/profile', label: 'Profile', icon: User },
      ];
    case 'NON_TEACHING':
    case 'NON_CLASS_INCHARGE':
      return [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/new-pass', label: 'New Pass', icon: Plus },
        { path: '/my-requests', label: 'My Requests', icon: Clock },
        { path: '/profile', label: 'Profile', icon: User },
      ];
    case 'HOD':
      return [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/new-pass', label: 'New Pass', icon: Plus },
        { path: '/my-requests', label: 'My Requests', icon: Clock },
        { path: '/profile', label: 'Profile', icon: User },
      ];
    case 'HR':
      return [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/new-pass', label: 'New Pass', icon: Plus },
        { path: '/my-requests', label: 'My Requests', icon: Clock },
        { path: '/exits', label: 'Exits', icon: LogOut },
        { path: '/profile', label: 'Profile', icon: User },
      ];
    case 'ADMIN_OFFICER':
      return [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/new-pass', label: 'New Pass', icon: Plus },
        { path: '/my-requests', label: 'My Requests', icon: Clock },
        { path: '/gate-logs', label: 'Gate Logs', icon: BookOpen },
        { path: '/profile', label: 'Profile', icon: User },
      ];
    case 'SECURITY':
      return [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/scanner', label: 'Scanner', icon: ScanLine },
        { path: '/active-persons', label: 'Active', icon: Users },
        { path: '/vehicles', label: 'Vehicles', icon: Car },
        { path: '/scan-history', label: 'History', icon: History },
      ];
    default:
      return [{ path: '/dashboard', label: 'Home', icon: Home }];
  }
}

export function getMobileNavItems(role: string): NavItem[] {
  return getNavItems(role);
}
