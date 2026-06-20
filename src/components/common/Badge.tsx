import { Text, View } from 'react-native';

import type { ColorToken } from '@/theme/colors';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

type BadgeProps = {
  label: string;
  /** Color token defining pill text + tonal background. */
  tone?: ColorToken;
};

/**
 * Compact pill for short labels (language pair, counters). Dumb UI primitive:
 * tonal background (`withAlpha` of token) and text in the same token — readable on light palettes
 * and dark palettes.
 */
export function Badge({ label, tone = 'textSecondary' }: BadgeProps) {
  const { colors } = useTheme();
  const color = colors[tone];

  return (
    <View style={{ backgroundColor: withAlpha(color, 0.15) }} className="rounded-full px-2 py-0.5">
      <Text style={{ color }} className="text-xs font-semibold">
        {label}
      </Text>
    </View>
  );
}
