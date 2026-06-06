import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getSQLiteDeckRepository } from '@/infrastructure/database/sqlite/repositories';
import { ACTIVE_COLLECTIONS_QUERY_KEY } from '@/features/collections/hooks/useActiveCollections';
import { ACTIVE_DECKS_QUERY_KEY } from '@/features/decks/hooks/useActiveDecks';
import { DECK_QUERY_KEY } from '@/features/decks/hooks/useDeck';
import { HOME_DATA_QUERY_KEY } from '@/features/home/hooks/useHomeData';

import { updateDeck, type UpdateDeckInput } from '../services/updateDeck';

export function useUpdateDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateDeckInput) =>
      updateDeck(input, {
        deckRepository: getSQLiteDeckRepository(),
      }),
    onSuccess: async (deck) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: HOME_DATA_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ACTIVE_COLLECTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ACTIVE_DECKS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: [...DECK_QUERY_KEY, deck.id] }),
      ]);
    },
  });
}
