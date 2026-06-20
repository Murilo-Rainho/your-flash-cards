import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sm2Scheduler } from '@/domain/schedulers/Sm2Scheduler';
import { getSQLiteReviewRepository } from '@/infrastructure/database/sqlite/repositories';
import { ACTIVE_COLLECTIONS_QUERY_KEY } from '@/features/collections/hooks/useActiveCollections';
import { ACTIVE_DECKS_QUERY_KEY } from '@/features/decks/hooks/useActiveDecks';
import { HOME_DATA_QUERY_KEY } from '@/features/home/hooks/useHomeData';

import { submitReview, type SubmitReviewInput } from '../services/submitReview';
import { REVIEW_TODAY_QUERY_KEY } from './useTodayReviews';

/**
 * Persists a rating (SM-2 + `ReviewLog`). Does not invalidate due queue during
 * the session (it is frozen); invalidates Home/collections/decks to reflect new due count on
 * return. All local (offline-first) — `sm2Scheduler` comes from domain (pure).
 */
export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitReviewInput) =>
      submitReview(input, {
        reviewRepository: getSQLiteReviewRepository(),
        scheduler: sm2Scheduler,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: HOME_DATA_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: REVIEW_TODAY_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ACTIVE_COLLECTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ACTIVE_DECKS_QUERY_KEY }),
      ]);
    },
  });
}
