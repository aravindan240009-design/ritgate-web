import { useState, useEffect } from 'react';

/**
 * CSS-based media query hook. Uses `matchMedia` so it stays in sync
 * with CSS breakpoints and doesn't cause layout thrashing.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    // Sync on mount
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** Mobile: 0–768px */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/** Tablet: 769–1024px */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

/** Desktop: 1025px+ */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}
