import type { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AppHeaderProps {
  label: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
  className?: string;
}

export default function AppHeader({
  label,
  title,
  subtitle,
  actions,
  onMenuClick,
  sidebarCollapsed,
  className,
}: AppHeaderProps) {
  return (
    <header className={cn('shrink-0 px-6 pt-5 lg:px-8 xl:px-10 2xl:px-12', className)}>
      <div className="relative overflow-visible rounded-[18px] border border-white/70 bg-gradient-to-br from-white via-white to-blue-50/60 px-6 py-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-blue-950/20 lg:px-8 lg:py-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent" />
        <div className="flex items-start justify-between gap-6">
          <div className="flex min-w-0 items-start gap-4">
            <button
              onClick={onMenuClick}
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-900 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="min-w-0">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
                {label}
              </p>
              <h1 className="truncate text-[28px] font-black leading-tight tracking-tight text-slate-950 dark:text-white">
                {title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600 dark:text-slate-400">
                {subtitle}
              </p>
            </div>
          </div>

          {actions && (
            <div className="flex shrink-0 items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
