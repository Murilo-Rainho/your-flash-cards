import { useQuery } from '@tanstack/react-query';

import { getSQLiteHomeReadRepository } from '@/infrastructure/database/sqlite/repositories';
import { getGreeting } from '@/features/home/services/getGreeting';
import { getHomeData, type HomeData } from '@/features/home/services/getHomeData';
import { getHomeQuickActions } from '@/features/home/services/homeQuickActions';
import type { DailyStudySummary } from '@/domain/entities/DailyStudySummary';

const emptySummary: DailyStudySummary = {
  dueCards: 0,
  difficultCards: 0,
  reviewedToday: 0,
  retentionPercentage: 0,
  streakDays: 0,
  masteredCards: 0,
};

export type HomeDataState = HomeData & {
  error: Error | null;
  isLoading: boolean;
  isRefreshing: boolean;
  refetch: () => void;
};

export function useHomeData(): HomeDataState {
  const query = useQuery<HomeData, Error>({
    queryKey: ['home-data'],
    queryFn: () =>
      getHomeData({
        repository: getSQLiteHomeReadRepository(),
        now: new Date(),
      }),
  });

  const data =
    query.data ??
    ({
      greeting: getGreeting(),
      summary: emptySummary,
      collections: [],
      quickActions: getHomeQuickActions(),
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
