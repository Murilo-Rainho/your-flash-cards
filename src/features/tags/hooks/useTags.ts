import { useQuery } from '@tanstack/react-query';

import type { Tag } from '@/domain/entities/Tag';
import { getSQLiteTagRepository } from '@/infrastructure/database/sqlite/repositories';

export const tagsQueryKey = (collectionId: string) => ['tags', collectionId] as const;

export function useTags(collectionId: string) {
  return useQuery<Tag[], Error>({
    queryKey: tagsQueryKey(collectionId),
    queryFn: () => getSQLiteTagRepository().listByCollection(collectionId),
    enabled: collectionId.length > 0,
  });
}
