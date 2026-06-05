import { createShadows } from './createShadows';
import { colors } from './colors';

/**
 * Presets de sombra estáticos (fallback build-time / fora do ThemeProvider).
 * Prefira `useTheme().shadows` em componentes para respeitar paleta do usuário.
 */
export const shadows = createShadows(colors);

export type { Shadows, ShadowPreset } from './createShadows';
export type ShadowToken = keyof ReturnType<typeof createShadows>;
