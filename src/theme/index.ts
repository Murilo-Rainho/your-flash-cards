/**
 * Central theme API. Use `import { colors, spacing, theme } from '@/theme'`.
 *
 * Single LIGHT theme in V1 (no dark theme). Colors also feed NativeWind via
 * `tailwind.config.ts` (single source = `colors.ts`).
 */
export { colors } from './colors';
export type { Colors, ColorToken } from './colors';

export {
  DEFAULT_THEME_PALETTE_PRESET,
  THEME_PALETTE_PRESETS,
  isThemePalettePresetId,
  resolvePalette,
} from './palettes';
export type { ColorPalette, ThemePalettePresetId } from './palettes';

export { ThemeProvider } from './ThemeContext';
export { useTheme } from './useTheme';
export { createShadows, withAlpha } from './createShadows';

export { spacing } from './spacing';
export type { Spacing, SpacingToken } from './spacing';

export { typography, fontSize, fontWeight, lineHeight } from './typography';
export type { Typography } from './typography';

export { radius } from './radius';
export type { Radius, RadiusToken } from './radius';

export { shadows } from './shadows';
export type { Shadows, ShadowToken } from './shadows';

export { icons } from './icons';
export type { IconName } from './icons';

import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { radius } from './radius';
import { shadows } from './shadows';

/** Aggregated theme object for contexts that do not use className (navigation, inline). */
export const theme = {
  colors,
  spacing,
  typography,
  radius,
  shadows,
} as const;

export type Theme = typeof theme;
