import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface DesktopPageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
}

export default function DesktopPageHeader({ title, subtitle, eyebrow, action, className }: DesktopPageHeaderProps) {
  return (
    <section className={cn('hidden lg:flex items-end justify-between gap-6 mb-6', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300 mb-2">
            {eyebrow}
          </p>
        )}
        <h2 className="text-[26px] font-bold tracking-tight text-slate-950 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </section>
  );
}
