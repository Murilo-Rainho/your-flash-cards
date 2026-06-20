import { useQuery } from '@tanstack/react-query';

import type { DailyReviewedCard } from '@/domain/repositories/ReviewRepository';
import { getSQLiteReviewRepository } from '@/infrastructure/database/sqlite/repositories';

export const REVIEW_TODAY_QUERY_KEY = ['review', 'today'] as const;

/**
 * History of cards reviewed today (§33 #12), with final rating per card. Unlike the due
 * queue, must reflect current state when opening the screen — hence cache is not frozen.
 */
export function useTodayReviews() {
  return useQuery<DailyReviewedCard[], Error>({
    queryKey: REVIEW_TODAY_QUERY_KEY,
    queryFn: () => getSQLiteReviewRepository().listReviewsForDay(new Date()),
  });
}
