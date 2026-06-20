import { useQuery } from '@tanstack/react-query';

import { LIMITS } from '@/constants/limits';
import type { DueReviewCard } from '@/domain/repositories/ReviewRepository';
import { getSQLiteReviewRepository } from '@/infrastructure/database/sqlite/repositories';

export const REVIEW_DUE_QUERY_KEY = ['review', 'due'] as const;

/**
 * Loads session due cards (§20: `LIMIT`, never all). Queue is "frozen" during
 * the session (`staleTime: Infinity`) to avoid refetch on each rating — the initial
 * snapshot defines the session; Home refreshes on return via invalidation on submit.
 */
export function useDueReviewCards() {
  return useQuery<DueReviewCard[], Error>({
    queryKey: REVIEW_DUE_QUERY_KEY,
    queryFn: () =>
      getSQLiteReviewRepository().listDueReviewCards({
        now: new Date(),
        limit: LIMITS.DEFAULT_REVIEW_SESSION_LIMIT,
      }),
    staleTime: Infinity,
    gcTime: 0,
  });
}
