import { useQuery } from '@tanstack/react-query';

import type { Deck } from '@/domain/entities/Deck';
import { getSQLiteDeckRepository } from '@/infrastructure/database/sqlite/repositories';
import { sortByName } from '@/utils/sort';

export const ACTIVE_DECKS_QUERY_KEY = ['decks', 'active'] as const;

export function useActiveDecks(collectionId?: string) {
  return useQuery<Deck[], Error>({
    queryKey: [...ACTIVE_DECKS_QUERY_KEY, collectionId],
    enabled: Boolean(collectionId),
    queryFn: () =>
      collectionId ? getSQLiteDeckRepository().listActiveByCollection(collectionId) : [],
    select: sortByName,
  });
}
