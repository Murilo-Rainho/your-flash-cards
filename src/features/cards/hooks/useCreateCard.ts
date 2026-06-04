import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getSQLiteCardRepository,
  getSQLiteCollectionRepository,
  getSQLiteDeckRepository,
} from '@/infrastructure/database/sqlite/repositories';
import { getExpoLocalMediaStorage } from '@/infrastructure/filesystem/ExpoLocalMediaStorage';
import { ACTIVE_COLLECTIONS_QUERY_KEY } from '@/features/collections/hooks/useActiveCollections';
import { ACTIVE_DECKS_QUERY_KEY } from '@/features/decks/hooks/useActiveDecks';
import { HOME_DATA_QUERY_KEY } from '@/features/home/hooks/useHomeData';

import { createCard, type CreateCardInput } from '../services/createCard';

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCardInput) =>
      createCard(input, {
        cardRepository: getSQLiteCardRepository(),
        collectionRepository: getSQLiteCollectionRepository(),
        deckRepository: getSQLiteDeckRepository(),
        mediaStorage: getExpoLocalMediaStorage(),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: HOME_DATA_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ACTIVE_COLLECTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ACTIVE_DECKS_QUERY_KEY }),
      ]);
    },
  });
}
