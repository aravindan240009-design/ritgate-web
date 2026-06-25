import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SectionLabelProps {
  icon: LucideIcon;
  children: ReactNode;
  /** Extra classes on the wrapper (e.g. bottom margin) so callers keep their spacing. */
  className?: string;
}

/**
 * Uniform section label used across every detail / info surface: a small
 * near-black icon in a neutral rounded badge, followed by the uppercase label.
 * Keeps icon + label styling identical on mobile, tablet and desktop.
 */
export default function SectionLabel({ icon: Icon, children, className }: SectionLabelProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white">
        <Icon className="h-[15px] w-[15px]" strokeWidth={2.4} aria-hidden="true" />
      </span>
      <span className="text-[10px] font-black uppercase leading-none tracking-widest text-slate-400">
        {children}
      </span>
    </div>
  );
}
