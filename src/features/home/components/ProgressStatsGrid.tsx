import { View } from 'react-native';

import { useStrings } from '@/features/settings/providers/PreferencesProvider';

import { ProgressStatCard } from './ProgressStatCard';

type ProgressStatsGridProps = {
  reviewedToday: number;
  retentionPercentage: number;
  streakDays: number;
  masteredCards: number;
};

/** 2×2 grid with quick daily metrics. */
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
        <ProgressStatCard
          label={strings.home.stats.reviewedToday}
          value={String(reviewedToday)}
          icon="reviewedToday"
          accentTone="primary"
        />
        <ProgressStatCard
          label={strings.home.stats.retention}
          value={`${retentionPercentage}%`}
          icon="retention"
          accentTone="success"
        />
      </View>
      <View className="flex-row gap-3">
        <ProgressStatCard
          label={strings.home.stats.streak}
          value={`${streakDays} ${streakDayLabel}`}
          icon="streak"
          accentTone="warning"
        />
        <ProgressStatCard
          label={strings.home.stats.mastered}
          value={String(masteredCards)}
          icon="mastered"
          accentTone="secondary"
        />
      </View>
    </View>
  );
}
