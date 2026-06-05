import { useQuery } from '@tanstack/react-query';

import type { DailyStudySummary } from '@/domain/entities/DailyStudySummary';
import { usePreferences } from '@/features/settings/providers/PreferencesProvider';
import { getGreeting } from '@/features/home/services/getGreeting';
import { getHomeData, type HomeData } from '@/features/home/services/getHomeData';
import { getHomeQuickActions } from '@/features/home/services/homeQuickActions';
import { getSQLiteHomeReadRepository } from '@/infrastructure/database/sqlite/repositories';

const emptySummary: DailyStudySummary = {
  dueCards: 0,
  difficultCards: 0,
  reviewedToday: 0,
  retentionPercentage: 0,
  streakDays: 0,
  masteredCards: 0,
};

export const HOME_DATA_QUERY_KEY = ['home-data'] as const;

export type HomeDataState = HomeData & {
  error: Error | null;
  isLoading: boolean;
  isRefreshing: boolean;
  refetch: () => void;
};

export function useHomeData(): HomeDataState {
  const { strings } = usePreferences();

  const query = useQuery<HomeData, Error>({
    queryKey: HOME_DATA_QUERY_KEY,
    queryFn: () =>
      getHomeData({
        repository: getSQLiteHomeReadRepository(),
        homeStrings: strings.home,
        now: new Date(),
      }),
  });

  const data =
    query.data ??
    ({
      greeting: getGreeting(strings.home.greeting),
      summary: emptySummary,
      collections: [],
      quickActions: getHomeQuickActions(strings.home.quickActions),
    } satisfies HomeData);

  return {
    ...data,
    error: query.error,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refetch: () => {
      void query.refetch();
    },
  };
}
