import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DesktopStatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: 'amber' | 'emerald' | 'rose' | 'blue' | 'slate';
  active?: boolean;
  onClick?: () => void;
}

const tones = {
  amber: 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-300 dark:bg-amber-950/25 dark:border-amber-900/40',
  emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/25 dark:border-emerald-900/40',
  rose: 'text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-300 dark:bg-rose-950/25 dark:border-rose-900/40',
  blue: 'text-blue-700 bg-blue-50 border-blue-100 dark:text-blue-300 dark:bg-blue-950/30 dark:border-blue-900/40',
  slate: 'text-slate-600 bg-slate-50 border-slate-100 dark:text-slate-300 dark:bg-slate-800/70 dark:border-slate-700',
};

export default function DesktopStatCard({ label, value, icon: Icon, tone = 'blue', active, onClick }: DesktopStatCardProps) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'desktop-stat-card group text-left',
        onClick && 'cursor-pointer',
        active && 'ring-2 ring-blue-500/15 border-blue-200 dark:border-blue-800'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-[30px] font-bold leading-none mt-3 tabular-nums text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className={cn('w-11 h-11 rounded-2xl border flex items-center justify-center', tones[tone])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Comp>
  );
}
