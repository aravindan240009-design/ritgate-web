import { cn } from '../../utils/cn';

interface DesktopSegmentedTabsProps<T extends string> {
  value: T;
  options: Array<{ value: T; label: string; count?: number }>;
  onChange: (value: T) => void;
  className?: string;
}

function statusTone(value: string, active: boolean) {
  if (!active) {
    return {
      button: 'bg-slate-100 text-slate-500 hover:text-slate-950 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white',
      count: 'text-slate-400',
    };
  }

  switch (value) {
    case 'PENDING':
      return {
        button: 'bg-amber-500 text-white shadow-lg shadow-amber-500/20',
        count: 'text-white',
      };
    case 'APPROVED':
      return {
        button: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20',
        count: 'text-white',
      };
    case 'REJECTED':
      return {
        button: 'bg-rose-600 text-white shadow-lg shadow-rose-500/20',
        count: 'text-white',
      };
    default:
      return {
        button: 'bg-slate-900 text-white shadow-lg shadow-slate-500/20 dark:bg-slate-100 dark:text-slate-950',
        count: 'text-white dark:text-slate-950',
      };
  }
}

export default function DesktopSegmentedTabs<T extends string>({
  value,
  options,
  onChange,
  className,
}: DesktopSegmentedTabsProps<T>) {
  return (
    <div className={cn('hidden lg:flex items-center gap-2', className)}>
      {options.map(option => {
        const active = option.value === value;
        const tone = statusTone(option.value, active);
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-10 rounded-xl px-4 text-xs font-bold uppercase tracking-[0.14em] transition-all',
              tone.button
            )}
          >
            {option.label}
            {typeof option.count !== 'undefined' && (
              <span className={cn('ml-2 tabular-nums', tone.count)}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
