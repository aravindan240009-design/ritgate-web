import { motion } from 'framer-motion';
import { useId } from 'react';
import { cn } from '../../utils/cn';

interface MotionLoaderProps {
  label?: string;
  className?: string;
  compact?: boolean;
}

/* Flight path — shared by the dashed trail AND the plane's offset-path so the
   plane always rides exactly on the dotted line. Coordinates are in the SAME
   pixel space as the box below (no scaling), so 1 unit === 1px. */
const TRAIL_PATH = 'M 34 196 C 150 196, 180 84, 300 74 S 420 44, 452 22';
const BOX_W = 480;
const BOX_H = 220;

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
 * Professional motion-graphic loader — a paper plane gliding along a gradient
 * dashed trail with drifting clouds and a soft glow. The plane follows the
 * trail exactly using a CSS offset-path, so it never drifts off the line.
 * Replaces static skeletons across all views.
 */
export default function MotionLoader({ label = 'Loading', className, compact = false }: MotionLoaderProps) {
  const gid = useId().replace(/[:]/g, '');
  const gradId = `ml-grad-${gid}`;
  const glowId = `ml-glow-${gid}`;

  return (
    <div
      className={cn(
        'motion-loader flex w-full flex-col items-center justify-center gap-8',
        compact ? 'py-12' : 'min-h-[55vh] py-16',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn('relative max-w-full shrink-0', compact && 'origin-center scale-[0.55]')}
        style={{ width: BOX_W, height: BOX_H }}
      >
        {/* Soft radial glow behind everything */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: BOX_W * 0.8,
            height: BOX_H * 0.8,
            background: 'radial-gradient(circle, rgba(93,104,248,0.16) 0%, rgba(93,104,248,0) 70%)',
          }}
          animate={{ scale: [0.9, 1.08, 0.9], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }}
        />

        {/* Flight trail (gradient dotted line) */}
        <svg
          viewBox={`0 0 ${BOX_W} ${BOX_H}`}
          className="absolute inset-0 h-full w-full overflow-visible"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(93,104,248,0.05)" />
              <stop offset="55%" stopColor="rgba(93,104,248,0.55)" />
              <stop offset="100%" stopColor="rgba(70,75,216,0.9)" />
            </linearGradient>
            <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* faint static guide line under the moving dashes */}
          <path
            d={TRAIL_PATH}
            stroke={`url(#${gradId})`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.25"
          />
          {/* animated travelling dashes */}
          <motion.path
            d={TRAIL_PATH}
            stroke={`url(#${gradId})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="1 18"
            filter={`url(#${glowId})`}
            animate={{ strokeDashoffset: [0, -38] }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
        </svg>

        {/* Drifting clouds — layered for depth */}
        <motion.div
          className="absolute left-3 top-3 text-slate-200 dark:text-slate-700"
          animate={{ x: [0, 16, 0], opacity: [0.5, 0.85, 0.5] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        >
          <Cloud className="h-11 w-20" />
        </motion.div>
        <motion.div
          className="absolute right-5 bottom-6 text-slate-200 dark:text-slate-700"
          animate={{ x: [0, -18, 0], opacity: [0.4, 0.75, 0.4] }}
          transition={{ repeat: Infinity, duration: 6.5, ease: 'easeInOut' }}
        >
          <Cloud className="h-12 w-24" />
        </motion.div>
        <motion.div
          className="absolute left-1/2 top-1/3 text-slate-100 dark:text-slate-800"
          animate={{ x: [0, 12, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 7.5, ease: 'easeInOut', delay: 0.6 }}
        >
          <Cloud className="h-8 w-16" />
        </motion.div>

        {/* Gliding paper plane — rides exactly along TRAIL_PATH */}
        <motion.div
          className="absolute left-0 top-0"
          style={{ offsetPath: `path('${TRAIL_PATH}')`, offsetRotate: '0deg' }}
          initial={{ offsetDistance: '0%', opacity: 0 }}
          animate={{ offsetDistance: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', times: [0, 0.16, 0.84, 1] }}
        >
          <motion.div
            animate={{ y: [0, -3, 0], rotate: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <PaperPlane className="h-20 w-20 drop-shadow-[0_12px_22px_rgba(70,75,216,0.45)]" />
          </motion.div>
        </motion.div>
      </div>

      <motion.span
        className="text-[13px] font-black uppercase tracking-[0.34em] text-slate-400 dark:text-slate-500"
        animate={{ opacity: [0.35, 1, 0.35] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
      >
        {label}
      </motion.span>
    </div>
  );
}
