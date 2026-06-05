import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getSQLiteTagRepository } from '@/infrastructure/database/sqlite/repositories';

import { TAGS_QUERY_KEY } from './useTags';
import { createTag, type CreateTagInput } from '../services/createTag';

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTagInput) =>
      createTag(input, {
        repository: getSQLiteTagRepository(),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    },
  });
}
