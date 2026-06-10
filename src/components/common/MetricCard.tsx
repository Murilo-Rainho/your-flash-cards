import { Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import type { ColorToken } from '@/theme/colors';
import { withAlpha } from '@/theme/createShadows';
import type { IconName } from '@/theme/icons';
import { useTheme } from '@/theme/useTheme';

export type MetricCardProps = {
  label: string;
  value: string;
  /** Icone semantico exibido no chip tonal (opcional). */
  icon?: IconName;
  /** Token de cor do chip de icone (fundo tonal). O valor permanece em textPrimary. */
  accentTone?: ColorToken;
};

/** Tile pequeno e reutilizavel de uma metrica de progresso. */
export function MetricCard({ label, value, icon, accentTone = 'primary' }: MetricCardProps) {
  const { colors, shadows } = useTheme();
  const accent = colors[accentTone];

  return (
    <View
      style={{
        borderColor: colors.border,
        backgroundColor: colors.surface,
        ...shadows.sm,
      }}
      className="flex-1 gap-3 rounded-2xl border p-4"
    >
      {icon ? (
        <View
          style={{ backgroundColor: withAlpha(accent, 0.16) }}
          className="h-9 w-9 items-center justify-center rounded-full"
        >
          <Icon name={icon} size={18} color={accent} />
        </View>
      ) : null}
      <View>
        <Text style={{ color: colors.textPrimary }} className="text-2xl font-bold">
          {value}
        </Text>
        <Text style={{ color: colors.textSecondary }} className="mt-1 text-xs">
          {label}
        </Text>
      </View>
    </View>
  );
}
