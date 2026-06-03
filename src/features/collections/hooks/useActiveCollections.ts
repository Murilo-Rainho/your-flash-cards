import { useQuery } from '@tanstack/react-query';

import type { Collection } from '@/domain/entities/Collection';
import { getSQLiteCollectionRepository } from '@/infrastructure/database/sqlite/repositories';

export const ACTIVE_COLLECTIONS_QUERY_KEY = ['collections', 'active'] as const;

export function useActiveCollections() {
  return useQuery<Collection[], Error>({
    queryKey: ACTIVE_COLLECTIONS_QUERY_KEY,
    queryFn: () => getSQLiteCollectionRepository().listActive(),
  });
}
