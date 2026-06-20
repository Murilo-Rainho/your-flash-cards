import type { QueryClient } from '@tanstack/react-query';

import { CARD_AGGREGATE_QUERY_KEY } from '@/features/cards/hooks/useCardAggregate';
import { DECK_CARDS_QUERY_KEY } from '@/features/cards/hooks/useDeckCards';
import { ACTIVE_COLLECTIONS_QUERY_KEY } from '@/features/collections/hooks/useActiveCollections';
import { ACTIVE_DECKS_QUERY_KEY } from '@/features/decks/hooks/useActiveDecks';
import { HOME_DATA_QUERY_KEY } from '@/features/home/hooks/useHomeData';
import { REVIEW_DUE_QUERY_KEY } from '@/features/review/hooks/useDueReviewCards';
import { REVIEW_TODAY_QUERY_KEY } from '@/features/review/hooks/useTodayReviews';

/** Revalidates caches affected by review mutations (submit or dev reset). */
export async function invalidateAppQueries(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: HOME_DATA_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: REVIEW_TODAY_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: REVIEW_DUE_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: ACTIVE_COLLECTIONS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: ACTIVE_DECKS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: DECK_CARDS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: CARD_AGGREGATE_QUERY_KEY }),
  ]);
}
