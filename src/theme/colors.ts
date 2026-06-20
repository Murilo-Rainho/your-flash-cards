/**
 * Color palette — single source of truth for the theme (light).
 *
 * Consumed in two ways:
 *  - In TS/JS: `import { colors } from '@/theme'` (raw values).
 *  - By NativeWind/Tailwind: `tailwind.config.ts` imports this file and generates
 *    classes (`bg-primary`, `text-textSecondary`, `border-border`, ...).
 *
 * LIGHT theme, focused on reading, study, and accessibility.
 * To re-theme the entire app, change only the values here.
 */
export const colors = {
  primary: '#2563EB',
  secondary: '#14B8A6',

  background: '#FFFFFF',
  surface: '#F8FAFC',

  textPrimary: '#0F172A',
  textSecondary: '#475569',

  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',

  border: '#E2E8F0',
} as const;

export type Colors = typeof colors;
export type ColorToken = keyof Colors;
