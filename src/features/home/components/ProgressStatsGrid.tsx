import { View } from 'react-native';

import { useStrings } from '@/features/settings/providers/PreferencesProvider';

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
  const strings = useStrings();
  const streakDayLabel =
    streakDays === 1 ? strings.home.stats.streakDaySingular : strings.home.stats.streakDayPlural;

  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <ProgressStatCard label={strings.home.stats.reviewedToday} value={String(reviewedToday)} />
        <ProgressStatCard label={strings.home.stats.retention} value={`${retentionPercentage}%`} />
      </View>
      <View className="flex-row gap-3">
        <ProgressStatCard
          label={strings.home.stats.streak}
          value={`🔥 ${streakDays} ${streakDayLabel}`}
        />
        <ProgressStatCard label={strings.home.stats.mastered} value={String(masteredCards)} />
      </View>
    </View>
  );
}
