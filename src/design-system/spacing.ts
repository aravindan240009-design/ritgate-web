/**
 * Precise Spacing Scale
 * NO random values allowed. ±2px deviation tolerance.
 */
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
} as const;

export type SpacingKey = keyof typeof spacing;
