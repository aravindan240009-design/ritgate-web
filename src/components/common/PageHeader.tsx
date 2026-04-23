import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  /** Show notification bell on the right (default true) */
  showBell?: boolean;
  /** Right-side custom element */
  right?: React.ReactNode;
}

/**
 * Consistent sub-page header: ← TITLE  🔔
 * Used on My Requests, History, Notifications, Profile, etc.
 */
export default function PageHeader({ title, onBack, showBell = true, right }: PageHeaderProps) {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <header
      className="sticky top-0 z-[80] bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] shrink-0"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center h-[72px] px-4 gap-3">
        {/* Back button */}
        <button
          onClick={onBack ?? (() => navigate(-1))}
          className="w-11 h-11 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-white active:scale-90 transition-transform shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Title */}
        <h1 className="flex-1 text-[18px] font-black text-slate-900 dark:text-white tracking-tight leading-none truncate">
          {title}
        </h1>

        {/* Right side */}
        {right ?? (showBell && (
          <button
            onClick={() => navigate('/notifications')}
            className="relative w-11 h-11 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-white active:scale-90 transition-transform shrink-0"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center px-1">
                <span className="text-[10px] font-black text-white leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </span>
            )}
          </button>
        ))}
      </div>
    </header>
  );
}
