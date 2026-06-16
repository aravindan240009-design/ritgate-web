import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DesktopStatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** Optional small caption shown under the value (e.g. "today") */
  hint?: string;
  tone?: 'amber' | 'emerald' | 'rose' | 'blue' | 'slate';
  active?: boolean;
  onClick?: () => void;
}

const tones = {
  amber: {
    chip: 'bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-600 border-amber-100 dark:from-amber-950/40 dark:to-amber-900/10 dark:text-amber-300 dark:border-amber-900/40',
    glow: 'bg-amber-400/15 dark:bg-amber-400/10',
    bar: 'bg-amber-500',
    ring: 'ring-amber-500/25 border-amber-200 dark:border-amber-800',
  },
  emerald: {
    chip: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-600 border-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/10 dark:text-emerald-300 dark:border-emerald-900/40',
    glow: 'bg-emerald-400/15 dark:bg-emerald-400/10',
    bar: 'bg-emerald-500',
    ring: 'ring-emerald-500/25 border-emerald-200 dark:border-emerald-800',
  },
  rose: {
    chip: 'bg-gradient-to-br from-rose-50 to-rose-100/50 text-rose-600 border-rose-100 dark:from-rose-950/40 dark:to-rose-900/10 dark:text-rose-300 dark:border-rose-900/40',
    glow: 'bg-rose-400/15 dark:bg-rose-400/10',
    bar: 'bg-rose-500',
    ring: 'ring-rose-500/25 border-rose-200 dark:border-rose-800',
  },
  blue: {
    chip: 'bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-700 border-blue-100 dark:from-blue-950/40 dark:to-blue-900/10 dark:text-blue-300 dark:border-blue-900/40',
    glow: 'bg-blue-400/15 dark:bg-blue-400/10',
    bar: 'bg-blue-600',
    ring: 'ring-blue-500/25 border-blue-200 dark:border-blue-800',
  },
  slate: {
    chip: 'bg-gradient-to-br from-slate-50 to-slate-100/60 text-slate-600 border-slate-100 dark:from-slate-800/70 dark:to-slate-800/30 dark:text-slate-300 dark:border-slate-700',
    glow: 'bg-slate-400/10',
    bar: 'bg-slate-500',
    ring: 'ring-slate-400/25 border-slate-300 dark:border-slate-600',
  },
};

export default function DesktopStatCard({ label, value, icon: Icon, hint, tone = 'blue', active, onClick }: DesktopStatCardProps) {
  const Comp = onClick ? 'button' : 'div';
  const t = tones[tone];
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'desktop-stat-card group text-left',
        onClick && 'cursor-pointer',
        active && cn('ring-2', t.ring),
      )}
    >
      {/* Soft tone glow */}
      <div className={cn('pointer-events-none absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl transition-opacity duration-300 opacity-70 group-hover:opacity-100', t.glow)} />

      {/* Active accent bar */}
      {active && <span className={cn('absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1 rounded-r-full', t.bar)} />}

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-[32px] font-extrabold leading-none mt-3 tabular-nums text-slate-950 dark:text-white">{value}</p>
          {hint && <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-2 truncate">{hint}</p>}
        </div>
        <div className={cn('w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-3', t.chip)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Comp>
  );
}
