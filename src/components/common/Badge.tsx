import { Text, View } from 'react-native';

import type { ColorToken } from '@/theme/colors';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

type BadgeProps = {
  label: string;
  /** Token de cor que define texto + fundo tonal do pill. */
  tone?: ColorToken;
};

/**
 * Pill compacto para rótulos curtos (par de idiomas, contadores). Primitivo de UI burro:
 * fundo tonal (`withAlpha` do token) e texto no mesmo token — legível nas paletas claras
 * e escuras.
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
