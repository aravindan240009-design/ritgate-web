import { type ReactNode } from 'react';
import { InboxIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-500 lg:desktop-card lg:py-16', className)}>
      <div className="w-14 h-14 rounded-[16px] bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center mb-4 text-blue-500 dark:text-blue-300">
        {icon || <InboxIcon className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[320px] leading-relaxed mt-1.5">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
