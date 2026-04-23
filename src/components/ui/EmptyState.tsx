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
    <div className={cn('flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-500', className)}>
      <div className="w-14 h-14 rounded-[16px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
        {icon || <InboxIcon className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight uppercase tracking-wide">{title}</h3>
      {description && (
        <p className="text-xs font-medium text-slate-400 max-w-[240px] leading-relaxed mt-1.5">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
