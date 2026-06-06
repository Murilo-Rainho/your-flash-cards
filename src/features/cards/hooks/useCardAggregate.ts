import { useQuery } from '@tanstack/react-query';

import type { CardAggregate } from '@/domain/repositories/CardRepository';
import { getSQLiteCardRepository } from '@/infrastructure/database/sqlite/repositories';

export const CARD_AGGREGATE_QUERY_KEY = ['card-aggregate'] as const;

export function useCardAggregate(id?: string) {
  return useQuery<CardAggregate | null, Error>({
    queryKey: [...CARD_AGGREGATE_QUERY_KEY, id],
    enabled: Boolean(id),
    queryFn: () => (id ? getSQLiteCardRepository().findAggregateById(id) : null),
  });
}
