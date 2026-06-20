/**
 * Spacing scale (px) for consistent padding, margin, and gap.
 * Always use these tokens instead of raw numbers.
 */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export type Spacing = typeof spacing;
export type SpacingToken = keyof Spacing;
