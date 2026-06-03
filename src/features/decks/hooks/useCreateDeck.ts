import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getSQLiteCollectionRepository,
  getSQLiteDeckRepository,
} from '@/infrastructure/database/sqlite/repositories';
import { ACTIVE_COLLECTIONS_QUERY_KEY } from '@/features/collections/hooks/useActiveCollections';
import { HOME_DATA_QUERY_KEY } from '@/features/home/hooks/useHomeData';

import { createDeck, type CreateDeckInput } from '../services/createDeck';

export function useCreateDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDeckInput) =>
      createDeck(input, {
        collectionRepository: getSQLiteCollectionRepository(),
        deckRepository: getSQLiteDeckRepository(),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: HOME_DATA_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ACTIVE_COLLECTIONS_QUERY_KEY }),
      ]);
    },
  });
}
