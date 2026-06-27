import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useCountUp } from '../../hooks/useCountUp';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: string;
  className?: string;
}

export default function KPICard({ title, value, icon, color = 'blue', className }: KPICardProps) {
  const colorMap: Record<string, string> = {
    blue: 'bg-[var(--color-primary)] shadow-blue-500/20',
    green: 'bg-emerald-600 shadow-emerald-500/20',
    amber: 'bg-amber-500 shadow-amber-500/20',
    red: 'bg-rose-600 shadow-rose-500/20',
    violet: 'bg-violet-600 shadow-violet-500/20',
    cyan: 'bg-cyan-600 shadow-cyan-500/20',
  };

  const animatedValue = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group bg-white dark:bg-slate-900 rounded-[16px] border border-slate-100 dark:border-slate-800 p-4 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-shadow h-full',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
            {animatedValue}
          </p>
        </div>
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-base shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3',
          colorMap[color]
        )}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
