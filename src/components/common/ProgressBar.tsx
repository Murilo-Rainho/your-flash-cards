import { View } from 'react-native';

import type { ColorToken } from '@/theme/colors';
import { useTheme } from '@/theme/useTheme';

type ProgressBarProps = {
  /** Progresso de 0 a 100 (clamp interno). */
  value: number;
  /** Token de cor do preenchimento. */
  tone?: ColorToken;
  /** Token de cor do trilho. */
  trackTone?: ColorToken;
  accessibilityLabel?: string;
};

/**
 * Barra de progresso temática (0–100). Primitivo de UI burro: recebe um token de cor
 * e resolve a paleta ativa via `useTheme` — sem cores hardcoded no consumidor.
 */
export function ProgressBar({
  value,
  tone = 'primary',
  trackTone = 'border',
  accessibilityLabel,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      style={{ backgroundColor: colors[trackTone] }}
      className="h-2 w-full overflow-hidden rounded-full"
    >
      <View
        style={{ backgroundColor: colors[tone], width: `${clamped}%` }}
        className="h-full rounded-full"
      />
    </View>
  );
}
