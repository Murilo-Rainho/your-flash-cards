import { useQuery } from '@tanstack/react-query';

import { getSQLiteDevToolsRepository } from '@/infrastructure/database/sqlite/repositories';

export const DEV_CARDS_REVIEW_STATE_QUERY_KEY = ['dev-tools', 'cards-review-state'] as const;

export function useDevCardsWithReviewState() {
  return useQuery({
    queryKey: DEV_CARDS_REVIEW_STATE_QUERY_KEY,
    queryFn: () => getSQLiteDevToolsRepository().listCardsWithReviewState(),
  });
}
