import { Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type ProgressStatCardProps = {
  label: string;
  value: string;
};

/** Tile pequeno e reutilizável de uma métrica de progresso. */
export function ProgressStatCard({ label, value }: ProgressStatCardProps) {
  const { colors, shadows } = useTheme();

  return (
    <View
      style={{
        borderColor: colors.border,
        backgroundColor: colors.surface,
        ...shadows.sm,
      }}
      className="flex-1 rounded-2xl border p-4"
    >
      <Text style={{ color: colors.textPrimary }} className="text-2xl font-bold">
        {value}
      </Text>
      <Text style={{ color: colors.textSecondary }} className="mt-1 text-sm">
        {label}
      </Text>
    </View>
  );
}
