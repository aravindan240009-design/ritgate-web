import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Animated count-up for dashboard metrics ("smooth stat reveal").
 *
 * - Accepts the raw card value (number or string). If it isn't a plain integer
 *   (e.g. "3 today", "—", "12%"), the original value is returned untouched.
 * - Counts from the previous value to the new one with an ease-out curve, so
 *   live refreshes animate the delta rather than restarting from zero.
 * - Fully respects `prefers-reduced-motion` (returns the final value instantly).
 */
export function useCountUp(value: number | string, durationMs = 900): number | string {
  const reduce = useReducedMotion();
  const numeric = typeof value === 'number'
    ? value
    : /^\d+$/.test(String(value).trim())
      ? Number(String(value).trim())
      : null;

  const [display, setDisplay] = useState<number>(numeric ?? 0);
  const fromRef = useRef<number>(numeric ?? 0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (numeric === null) return;
    if (reduce) {
      setDisplay(numeric);
      fromRef.current = numeric;
      return;
    }

    const from = fromRef.current;
    const to = numeric;
    if (from === to) return;

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [numeric, durationMs, reduce]);

  return numeric === null ? value : display;
}
