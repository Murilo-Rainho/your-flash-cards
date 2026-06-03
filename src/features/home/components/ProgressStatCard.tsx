import { Text, View } from 'react-native';

import { shadows } from '@/theme';

type ProgressStatCardProps = {
  label: string;
  value: string;
};

/** Tile pequeno e reutilizável de uma métrica de progresso. */
export function ProgressStatCard({ label, value }: ProgressStatCardProps) {
  return (
    <View style={shadows.sm} className="flex-1 rounded-2xl border border-border bg-surface p-4">
      <Text className="text-2xl font-bold text-textPrimary">{value}</Text>
      <Text className="mt-1 text-sm text-textSecondary">{label}</Text>
    </View>
  );
}
