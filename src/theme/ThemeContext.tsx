import { createContext, useMemo, type ReactNode } from 'react';

import { createShadows, type Shadows } from './createShadows';
import { colors as defaultColors } from './colors';
import {
  DEFAULT_THEME_PALETTE_PRESET,
  resolvePalette,
  type ColorPalette,
  type ThemePalettePresetId,
} from './palettes';

export type ThemeContextValue = {
  colors: ColorPalette;
  shadows: Shadows;
  palettePresetId: ThemePalettePresetId;
};

const defaultShadows = createShadows(defaultColors);

export const ThemeContext = createContext<ThemeContextValue>({
  colors: defaultColors,
  shadows: defaultShadows,
  palettePresetId: DEFAULT_THEME_PALETTE_PRESET,
});

type ThemeProviderProps = {
  palettePresetId: ThemePalettePresetId;
  children: ReactNode;
};

export function ThemeProvider({ palettePresetId, children }: ThemeProviderProps) {
  const value = useMemo<ThemeContextValue>(() => {
    const colors = resolvePalette(palettePresetId);
    return {
      colors,
      shadows: createShadows(colors),
      palettePresetId,
    };
  }, [palettePresetId]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
