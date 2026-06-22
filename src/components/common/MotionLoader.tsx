import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface MotionLoaderProps {
  label?: string;
  className?: string;
  compact?: boolean;
}

function PaperPlane({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* upper wing */}
      <path d="M45 5 L3 22.5 L22 28 Z" fill="#5D68F8" />
      {/* lower wing */}
      <path d="M45 5 L22 28 L27 43 Z" fill="#464BD8" />
      {/* inner fold */}
      <path d="M22 28 L15.5 40.5 L25 33.5 Z" fill="#3831AC" />
    </svg>
  );
}

function Cloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M34 23 H11 a8.5 8.5 0 0 1 -1.6 -16.9 a10.5 10.5 0 0 1 20 2.4 A6.5 6.5 0 0 1 34 23 Z" />
    </svg>
  );
}

/**
 * Professional motion-graphic loader — a paper plane gliding along a dashed
 * trail with drifting clouds. Replaces static skeletons across all views.
 */
export default function MotionLoader({ label = 'Loading', className, compact = false }: MotionLoaderProps) {
  return (
    <div
      className={cn('motion-loader flex w-full flex-col items-center justify-center gap-5', compact ? 'py-10' : 'py-16', className)}
      role="status"
      aria-live="polite"
    >
      <div className="relative h-28 w-56">
        {/* Flight trail */}
        <svg viewBox="0 0 224 112" className="absolute inset-0 h-full w-full" fill="none" preserveAspectRatio="none">
          <motion.path
            d="M14 98 C 64 98, 78 44, 134 40 S 198 28, 210 16"
            stroke="rgba(93,104,248,0.40)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="1 13"
            animate={{ strokeDashoffset: [0, -28] }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
        </svg>

        {/* Drifting clouds */}
        <motion.div
          className="absolute left-1 top-2 text-slate-200 dark:text-slate-700"
          animate={{ x: [0, 9, 0], opacity: [0.5, 0.85, 0.5] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        >
          <Cloud className="h-5 w-9" />
        </motion.div>
        <motion.div
          className="absolute right-2 bottom-3 text-slate-200 dark:text-slate-700"
          animate={{ x: [0, -11, 0], opacity: [0.4, 0.75, 0.4] }}
          transition={{ repeat: Infinity, duration: 6.5, ease: 'easeInOut' }}
        >
          <Cloud className="h-6 w-11" />
        </motion.div>

        {/* Gliding paper plane */}
        <motion.div
          className="absolute left-0 top-0"
          animate={{ x: [6, 184], y: [82, 8], rotate: [-7, 9], opacity: [0, 1, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut', times: [0, 0.18, 0.82, 1] }}
        >
          <PaperPlane className="h-9 w-9 drop-shadow-[0_8px_12px_rgba(70,75,216,0.35)]" />
        </motion.div>
      </div>

      <motion.span
        className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500"
        animate={{ opacity: [0.35, 1, 0.35] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
      >
        {label}
      </motion.span>
    </div>
  );
}
