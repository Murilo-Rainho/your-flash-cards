import { View } from 'react-native';

import { ProgressStatCard } from './ProgressStatCard';

type ProgressStatsGridProps = {
  reviewedToday: number;
  retentionPercentage: number;
  streakDays: number;
  masteredCards: number;
};

/** Grade 2×2 com as métricas rápidas do dia. */
export function ProgressStatsGrid({
  reviewedToday,
  retentionPercentage,
  streakDays,
  masteredCards,
}: ProgressStatsGridProps) {
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <ProgressStatCard label="Revisados hoje" value={String(reviewedToday)} />
        <ProgressStatCard label="Retenção" value={`${retentionPercentage}%`} />
      </View>
      <View className="flex-row gap-3">
        <ProgressStatCard label="Streak" value={`🔥 ${streakDays} dias`} />
        <ProgressStatCard label="Dominados" value={String(masteredCards)} />
      </View>
    </View>
  );
}
