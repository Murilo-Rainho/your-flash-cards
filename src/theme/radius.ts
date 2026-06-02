/**
 * Raios de borda (em px) usados em cards, botões e inputs.
 */
export const radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export type Radius = typeof radius;
export type RadiusToken = keyof Radius;
