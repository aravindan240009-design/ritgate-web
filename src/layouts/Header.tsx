import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, ChevronLeft, User, Search } from 'lucide-react';
import NotificationBell from '../components/common/NotificationBell';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { ROLE_LABELS } from '../config/api.config';
import { cn } from '../utils/cn';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

const pageTitles: Record<string, string> = {
  '/dashboard':       'Dashboard',
  '/requests':        'My Requests',
  '/history':         'History',
  '/profile':         'Profile',
  '/notifications':   'Notifications',
  '/new-pass':        'New Gate Pass',
  '/my-requests':     'My Requests',
  '/gate-logs':       'Gate Logs',
  '/scanner':         'QR Scanner',
  '/active-persons':  'Active Persons',
  '/vehicles':        'Vehicles',
  '/scan-history':    'Scan History',
  '/visitor-register':'Visitor Register',
  '/hod-contacts':    'HOD Directory',
  '/users':           'Unit Directory',
  '/bulk-pass':       'Bulk Gate Pass',
  '/guest-register':  'Guest Registration',
  '/new-request':     'New Request',
  '/qr-codes':        'My QR Codes',
};

export default function Header({ onMenuClick, sidebarCollapsed }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useAuth();
  const { profileImage } = useProfile();

  const title = pageTitles[location.pathname] || 'RIT Gate';
  const isDashboard = location.pathname === '/dashboard';

  const displayName = (() => {
    if (!user) return '';
    const u = user as any;
    return u.fullName || u.staffName || u.hodName || u.hrName || u.name ||
      (u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : '') || 'User';
  })();

  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleLabel = ROLE_LABELS[role || ''] || role || '';

  return (
    <header className="sticky top-0 z-30 h-[60px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 flex items-center shrink-0 overflow-visible">
      <div className="flex items-center justify-between w-full px-6 gap-4">

        {/* ── Left: Menu toggle + Breadcrumb ──────────────── */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Sidebar toggle */}
          <button
            onClick={onMenuClick}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Back button on sub-pages */}
          {!isDashboard && (
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
              aria-label="Go back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Page title */}
          <div className="flex flex-col min-w-0">
            <h1 className="text-[15px] font-semibold text-slate-900 dark:text-white leading-none truncate">
              {title}
            </h1>
            {isDashboard && (
              <span className="text-[11px] text-slate-400 mt-0.5 leading-none">
                RIT
              </span>
            )}
          </div>
        </div>

        {/* ── Right: Actions ──────────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notification bell */}
          <NotificationBell />

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* User profile button */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
              {profileImage ? (
                <img src={profileImage} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-[11px] font-bold">{initials}</span>
              )}
            </div>

            {/* Name + role */}
            <div className="flex flex-col items-start">
              <span className="text-[12px] font-semibold text-slate-900 dark:text-white leading-none truncate max-w-[120px]">
                {displayName}
              </span>
              {roleLabel && (
                <span className="text-[10px] text-slate-400 leading-none mt-0.5 truncate max-w-[120px]">
                  {roleLabel}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
