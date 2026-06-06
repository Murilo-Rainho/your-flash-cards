import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getSQLiteTagRepository } from '@/infrastructure/database/sqlite/repositories';

import { tagsQueryKey } from './useTags';
import { updateTag, type UpdateTagInput } from '../services/updateTag';

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTagInput) =>
      updateTag(input, {
        repository: getSQLiteTagRepository(),
      }),
    onSuccess: async (tag) => {
      await queryClient.invalidateQueries({ queryKey: tagsQueryKey(tag.collectionId) });
    },
  });
}
