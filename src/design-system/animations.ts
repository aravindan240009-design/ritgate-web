/**
 * Animation Configuration — Adaptive
 * Mobile: lightweight & fast
 * Desktop: premium Stripe/Linear-quality
 */

export const transitions = {
  page: {
    initial: { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
    transition: { duration: 0.15, ease: 'easeOut' },
  },
  feedback: {
    tap: { scale: 0.98 },
    hover: { scale: 1.01 },
    duration: 0.08,
  },
} as const;

/** Desktop-quality staggered card entrance */
export const desktopCardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
};

/** Desktop page transition */
export const desktopPageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

/** Mobile page transition — fast */
export const mobilePageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.08 } },
};

/** Sidebar item hover */
export const sidebarItemVariants = {
  rest: { x: 0 },
  hover: { x: 2, transition: { duration: 0.15 } },
};
