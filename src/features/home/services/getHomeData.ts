import type { QuickAction } from '@/domain/entities/QuickAction';
import type { DailyStudySummary } from '@/domain/entities/DailyStudySummary';
import type { HomeReadRepository } from '@/domain/repositories/HomeReadRepository';
import type { CollectionSummary } from '@/features/home/types';
import type { StringCatalog } from '@/strings/types';

import { getGreeting } from './getGreeting';
import { getHomeQuickActions } from './homeQuickActions';

export type HomeData = {
  greeting: string;
  summary: DailyStudySummary;
  collections: CollectionSummary[];
  quickActions: QuickAction[];
};

type GetHomeDataOptions = {
  repository: HomeReadRepository;
  homeStrings: StringCatalog['home'];
  now?: Date;
};

export async function getHomeData({
  repository,
  homeStrings,
  now = new Date(),
}: GetHomeDataOptions): Promise<HomeData> {
  const [summary, collections] = await Promise.all([
    repository.getDailyStudySummary(now),
    repository.listCollectionSummaries(now),
  ]);

  return {
    greeting: getGreeting(homeStrings.greeting, now),
    summary,
    collections,
    quickActions: getHomeQuickActions(homeStrings.quickActions),
  };
}
