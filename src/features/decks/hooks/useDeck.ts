import { useQuery } from '@tanstack/react-query';

import type { Deck } from '@/domain/entities/Deck';
import { getSQLiteDeckRepository } from '@/infrastructure/database/sqlite/repositories';

export const DECK_QUERY_KEY = ['deck'] as const;

export function useDeck(id?: string) {
  return useQuery<Deck | null, Error>({
    queryKey: [...DECK_QUERY_KEY, id],
    enabled: Boolean(id),
    queryFn: () => (id ? getSQLiteDeckRepository().findById(id) : null),
  });
}
