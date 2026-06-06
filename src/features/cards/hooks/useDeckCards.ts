import { useQuery } from '@tanstack/react-query';

import type { Card } from '@/domain/entities/Card';
import { getSQLiteCardRepository } from '@/infrastructure/database/sqlite/repositories';

export const DECK_CARDS_QUERY_KEY = ['deck-cards'] as const;

export function useDeckCards(deckId?: string) {
  return useQuery<Card[], Error>({
    queryKey: [...DECK_CARDS_QUERY_KEY, deckId],
    enabled: Boolean(deckId),
    queryFn: () => (deckId ? getSQLiteCardRepository().listActiveByDeck(deckId) : []),
  });
}
