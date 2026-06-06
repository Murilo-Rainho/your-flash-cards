import { useQuery } from '@tanstack/react-query';

import type { Collection } from '@/domain/entities/Collection';
import { getSQLiteCollectionRepository } from '@/infrastructure/database/sqlite/repositories';

export const COLLECTION_QUERY_KEY = ['collection'] as const;

export function useCollection(id?: string) {
  return useQuery<Collection | null, Error>({
    queryKey: [...COLLECTION_QUERY_KEY, id],
    enabled: Boolean(id),
    queryFn: () => (id ? getSQLiteCollectionRepository().findById(id) : null),
  });
}
