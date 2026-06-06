import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getSQLiteCollectionRepository } from '@/infrastructure/database/sqlite/repositories';
import { HOME_DATA_QUERY_KEY } from '@/features/home/hooks/useHomeData';

import { ACTIVE_COLLECTIONS_QUERY_KEY } from './useActiveCollections';
import { COLLECTION_QUERY_KEY } from './useCollection';
import { updateCollection, type UpdateCollectionInput } from '../services/updateCollection';

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCollectionInput) =>
      updateCollection(input, {
        repository: getSQLiteCollectionRepository(),
      }),
    onSuccess: async (collection) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: HOME_DATA_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ACTIVE_COLLECTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: [...COLLECTION_QUERY_KEY, collection.id] }),
      ]);
    },
  });
}
