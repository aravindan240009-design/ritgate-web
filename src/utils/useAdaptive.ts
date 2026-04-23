import { useIsMobile, useIsTablet, useIsDesktop } from './useMediaQuery';

/**
 * Single source of truth for adaptive UI mode.
 * Mobile  ≤ 768px  → app-like PWA experience
 * Tablet  769–1024px → hybrid layout
 * Desktop ≥ 1025px  → premium SaaS dashboard
 */
export function useAdaptive() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  return {
    isMobile,
    isTablet,
    isDesktop,
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
