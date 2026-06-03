import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getSQLiteCollectionRepository } from '@/infrastructure/database/sqlite/repositories';
import { HOME_DATA_QUERY_KEY } from '@/features/home/hooks/useHomeData';

import { ACTIVE_COLLECTIONS_QUERY_KEY } from './useActiveCollections';
import { createCollection, type CreateCollectionInput } from '../services/createCollection';

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCollectionInput) =>
      createCollection(input, {
        repository: getSQLiteCollectionRepository(),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: HOME_DATA_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ACTIVE_COLLECTIONS_QUERY_KEY }),
      ]);
    },
  });
}
