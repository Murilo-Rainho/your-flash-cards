import { View } from 'react-native';

import type { ColorToken } from '@/theme/colors';
import { useTheme } from '@/theme/useTheme';

type ProgressBarProps = {
  /** Progress from 0 to 100 (clamped internally). */
  value: number;
  /** Fill color token. */
  tone?: ColorToken;
  /** Track color token. */
  trackTone?: ColorToken;
  accessibilityLabel?: string;
};

/**
 * Themed progress bar (0–100). Dumb UI primitive: receives a color token
 * and resolves the active palette via `useTheme` — no hard-coded colors in consumers.
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
