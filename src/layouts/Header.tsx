import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronLeft, Menu } from 'lucide-react';
import NotificationBell from '../components/common/NotificationBell';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/requests': 'My Requests',
  '/history': 'History',
  '/profile': 'Profile',
  '/notifications': 'Notifications',
  '/new-pass': 'New Request',
  '/my-requests': 'My Requests',
  '/gate-logs': 'Gate Logs',
  '/exits': 'Exit Logs',
  '/scanner': 'QR Scanner',
  '/active-persons': 'Active Persons',
  '/vehicles': 'Vehicles',
  '/scan-history': 'Scan History',
  '/visitor-register': 'Visitor Register',
  '/visitor-qr': 'Visitor QR',
  '/hod-contacts': 'HOD Directory',
  '/users': 'Unit Directory',
  '/bulk-pass': 'Bulk Student Pass',
  '/hod-events': 'Events',
  '/event-csv': 'Event CSV Upload',
  '/guest-register': 'Pre-register guest',
  '/new-request': 'New Request',
  '/qr-codes': 'My QR Codes',
  '/participants': 'Participants',
};

export default function Header({ onMenuClick, sidebarCollapsed }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'RIT Gate';
  const isDashboard = location.pathname === '/dashboard';
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  return (
    <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center overflow-visible border-b border-slate-200 bg-white/92 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-slate-800 dark:bg-[#0b1120]/95 lg:h-[64px]">
      <div className="flex w-full items-center justify-between gap-4 px-5 lg:px-8 xl:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="h-4 w-4" />
          </button>

          {!isDashboard && (
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
              aria-label="Go back"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          <div className="hidden min-w-0 lg:block">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
              RIT Gate / {title}
            </p>
            <h1 className="mt-0.5 truncate text-[18px] font-bold leading-tight tracking-tight text-slate-950 dark:text-white">
              {title}
            </h1>
          </div>

          <h1 className="desktop-header-title truncate text-[18px] font-bold leading-none tracking-tight text-slate-950 dark:text-white lg:hidden">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 lg:flex">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            {currentDate}
          </div>
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
