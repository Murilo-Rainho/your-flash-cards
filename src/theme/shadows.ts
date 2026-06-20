import { createShadows } from './createShadows';
import { colors } from './colors';

/**
 * Static shadow presets (build-time fallback / outside ThemeProvider).
 * Prefer `useTheme().shadows` in components to respect the user's palette.
 */
export const shadows = createShadows(colors);

export type { Shadows, ShadowPreset } from './createShadows';
export type ShadowToken = keyof ReturnType<typeof createShadows>;
