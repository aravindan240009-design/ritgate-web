import { useIsMobile, useIsTablet, useIsDesktop, useIsLargeDesktop } from './useMediaQuery';

/**
 * Single source of truth for adaptive UI mode.
 * Mobile  ≤ 768px       → app-like PWA experience
 * Dashboard ≥ 769px     → premium SaaS dashboard (tablet = compact desktop)
 * Large desktop ≥ 1280px → extra spacing / multi-column density
 *
 * `isDesktop` intentionally returns true for tablets so they inherit the full
 * professional dashboard layout instead of stretched mobile cards.
 */
export function useAdaptive() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const isLargeDesktop = useIsLargeDesktop();

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    /** True when NOT mobile — sidebar/header visible */
    isWide: !isMobile,
    /** Animation config — lightweight on mobile, premium on desktop */
    anim: isMobile
      ? {
          page: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12 } },
          card: { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.15 } },
          stagger: 0.04,
        }
      : {
          page: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
          card: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
          stagger: 0.06,
        },
  };
}
