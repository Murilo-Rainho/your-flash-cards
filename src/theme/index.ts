import { colors, dark, fontSize, light, palette, radius, spacing } from './tokens';

export { colors, dark, fontSize, light, palette, radius, spacing };

/**
 * Objeto de tema agregado para uso em contextos que NÃO aceitam className
 * (ex.: react-navigation, expo-status-bar, react-native-chart-kit, estilos inline).
 *
 * Em telas e componentes, prefira as classes do NativeWind (`bg-background`,
 * `text-content-primary`, ...). Use `theme` apenas para valores brutos.
 */
export const theme = {
  colors,
  radius,
  spacing,
  fontSize,
  palette,
} as const;

export type Theme = typeof theme;
export type { ThemeColors } from './tokens';
