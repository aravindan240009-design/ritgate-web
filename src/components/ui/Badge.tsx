import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { STATUS_MAP } from '../../config/api.config';

interface BadgeProps {
  status?: string;
  variant?: 'amber' | 'orange' | 'blue' | 'green' | 'red' | 'gray' | 'indigo' | 'emerald' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Badge — Standardized status indicators with vibrant colors.
 */
export default function Badge({ status, variant, size = 'sm', pulse = false, className, children }: BadgeProps) {
  const mapped = status ? (STATUS_MAP[status] || STATUS_MAP['PENDING']) : null;
  const isPending = status ? (status.startsWith('PENDING') || status === 'APPROVED_BY_STAFF' || status === 'APPROVED_BY_HOD') : false;

  const colorVariants: Record<string, string> = {
    amber: 'bg-amber-100/85 text-amber-700 border-amber-200/80 shadow-amber-500/10 dark:bg-amber-900/35 dark:text-amber-300 dark:border-amber-800/40',
    orange: 'bg-orange-100/85 text-orange-700 border-orange-200/80 shadow-orange-500/10 dark:bg-orange-900/35 dark:text-orange-300 dark:border-orange-800/40',
    blue: 'bg-blue-100/85 text-blue-700 border-blue-200/80 shadow-blue-500/10 dark:bg-blue-900/35 dark:text-blue-300 dark:border-blue-800/40',
    green: 'bg-emerald-100/85 text-emerald-700 border-emerald-200/80 shadow-emerald-500/10 dark:bg-emerald-900/35 dark:text-emerald-300 dark:border-emerald-800/40',
    red: 'bg-rose-100/85 text-rose-700 border-rose-200/80 shadow-rose-500/10 dark:bg-rose-900/35 dark:text-rose-300 dark:border-rose-800/40',
    gray: 'bg-slate-100/85 text-slate-600 border-slate-200/80 shadow-slate-500/10 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-700/40',
    indigo: 'bg-violet-100/85 text-violet-700 border-violet-200/80 shadow-violet-500/10 dark:bg-violet-900/35 dark:text-violet-300 dark:border-violet-800/40',
    emerald: 'bg-emerald-100/85 text-emerald-700 border-emerald-200/80 shadow-emerald-500/10 dark:bg-emerald-900/35 dark:text-emerald-300 dark:border-emerald-800/40',
    success: 'bg-emerald-100/85 text-emerald-700 border-emerald-200/80 shadow-emerald-500/10 dark:bg-emerald-900/35 dark:text-emerald-300 dark:border-emerald-800/40',
    warning: 'bg-amber-100/85 text-amber-700 border-amber-200/80 shadow-amber-500/10 dark:bg-amber-900/35 dark:text-amber-300 dark:border-amber-800/40',
    danger: 'bg-rose-100/85 text-rose-700 border-rose-200/80 shadow-rose-500/10 dark:bg-rose-900/35 dark:text-rose-300 dark:border-rose-800/40',
  };

  const activeVariant = variant || mapped?.color || 'gray';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-black rounded-full whitespace-nowrap border uppercase tracking-wider shadow-sm backdrop-blur-xl animate-fade-in',
        colorVariants[activeVariant] || colorVariants.gray,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[12px]',
        className,
      )}
    >
      {(pulse || isPending) && (
        <span className={cn(
          'w-1 h-1 rounded-full animate-pulse mr-0.5',
          activeVariant === 'amber' && 'bg-amber-500',
          activeVariant === 'orange' && 'bg-orange-500',
          activeVariant === 'blue' && 'bg-blue-500',
          activeVariant === 'green' && 'bg-emerald-500',
          activeVariant === 'red' && 'bg-rose-500',
          activeVariant === 'gray' && 'bg-slate-500',
          activeVariant === 'indigo' && 'bg-blue-500',
          activeVariant === 'emerald' && 'bg-emerald-500',
        )} />
      )}
      {children || mapped?.label}
    </span>
  );
}
