import { useQuery } from '@tanstack/react-query';

import type { Tag } from '@/domain/entities/Tag';
import { getSQLiteTagRepository } from '@/infrastructure/database/sqlite/repositories';

export const TAGS_QUERY_KEY = ['tags', 'all'] as const;

export function useTags() {
  return useQuery<Tag[], Error>({
    queryKey: TAGS_QUERY_KEY,
    queryFn: () => getSQLiteTagRepository().listAll(),
  });
}
