import { Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import type { ColorToken } from '@/theme/colors';
import { withAlpha } from '@/theme/createShadows';
import type { IconName } from '@/theme/icons';
import { useTheme } from '@/theme/useTheme';

type ProgressStatCardProps = {
  label: string;
  value: string;
  /** Ícone semântico exibido no chip tonal (opcional). */
  icon?: IconName;
  /** Token de cor do chip de ícone (fundo tonal). O valor permanece em textPrimary. */
  accentTone?: ColorToken;
};

/** Tile pequeno e reutilizável de uma métrica de progresso. */
export function ProgressStatCard({
  label,
  value,
  icon,
  accentTone = 'primary',
}: ProgressStatCardProps) {
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
