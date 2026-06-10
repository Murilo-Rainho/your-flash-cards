import type { ColorToken } from './colors';
import { colors as defaultColors } from './colors';

export type ColorPalette = Record<ColorToken, string>;

export const THEME_PALETTE_PRESETS = {
  default: defaultColors,
  ocean: {
    primary: '#0EA5E9',
    secondary: '#06B6D4',
    background: '#FFFFFF',
    surface: '#F0F9FF',
    textPrimary: '#0C4A6E',
    textSecondary: '#0369A1',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    border: '#BAE6FD',
  },
  forest: {
    primary: '#16A34A',
    secondary: '#14B8A6',
    background: '#FFFFFF',
    surface: '#F0FDF4',
    textPrimary: '#14532D',
    textSecondary: '#166534',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    border: '#BBF7D0',
  },
  sunset: {
    primary: '#F97316',
    secondary: '#EC4899',
    background: '#FFFFFF',
    surface: '#FFF7ED',
    textPrimary: '#9A3412',
    textSecondary: '#C2410C',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    border: '#FED7AA',
  },
  sakura: {
    primary: '#EC4899',
    secondary: '#8B5CF6',
    background: '#FFFFFF',
    surface: '#FDF2F8',
    textPrimary: '#9D174D',
    textSecondary: '#BE185D',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    border: '#FBCFE8',
  },
  emerald: {
    primary: '#10B981',
    secondary: '#84CC16',
    background: '#F8FFFC',
    surface: '#ECFDF5',
    textPrimary: '#065F46',
    textSecondary: '#047857',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    border: '#A7F3D0',
  },
  royal: {
    primary: '#7C3AED',
    secondary: '#F59E0B',
    background: '#111827',
    surface: '#1F2937',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    border: '#374151',
  },
  midnight: {
    primary: '#6366F1',
    secondary: '#22D3EE',
    background: '#0B1120',
    surface: '#172033',
    textPrimary: '#E2E8F0',
    textSecondary: '#94A3B8',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    border: '#334155',
  },
  carbon: {
    primary: '#8B5CF6',
    secondary: '#2DD4BF',
    background: '#0A0A0A',
    surface: '#1A1A1A',
    textPrimary: '#F5F5F5',
    textSecondary: '#A3A3A3',
    success: '#4ADE80',
    warning: '#FACC15',
    danger: '#F87171',
    border: '#2E2E2E',
  },
} satisfies Record<string, ColorPalette>;

export type ThemePalettePresetId = keyof typeof THEME_PALETTE_PRESETS;

export const DEFAULT_THEME_PALETTE_PRESET: ThemePalettePresetId = 'default';

export function isThemePalettePresetId(value: string): value is ThemePalettePresetId {
  return value in THEME_PALETTE_PRESETS;
}

export function resolvePalette(presetId: string): ColorPalette {
  if (isThemePalettePresetId(presetId)) {
    return THEME_PALETTE_PRESETS[presetId];
  }

  return THEME_PALETTE_PRESETS[DEFAULT_THEME_PALETTE_PRESET];
}
