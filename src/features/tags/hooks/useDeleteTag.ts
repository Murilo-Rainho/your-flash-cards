import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getSQLiteTagRepository } from '@/infrastructure/database/sqlite/repositories';

import { tagsQueryKey } from './useTags';
import { deleteTag } from '../services/deleteTag';

export type DeleteTagInput = {
  id: string;
  collectionId: string;
};

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeleteTagInput) =>
      deleteTag(id, {
        repository: getSQLiteTagRepository(),
      }),
    onSuccess: async (_result, input) => {
      await queryClient.invalidateQueries({ queryKey: tagsQueryKey(input.collectionId) });
    },
  });
}
