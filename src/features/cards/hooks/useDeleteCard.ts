import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getSQLiteCardRepository } from '@/infrastructure/database/sqlite/repositories';
import { ACTIVE_COLLECTIONS_QUERY_KEY } from '@/features/collections/hooks/useActiveCollections';
import { ACTIVE_DECKS_QUERY_KEY } from '@/features/decks/hooks/useActiveDecks';
import { DECK_CARDS_QUERY_KEY } from '@/features/cards/hooks/useDeckCards';
import { HOME_DATA_QUERY_KEY } from '@/features/home/hooks/useHomeData';

import { deleteCard } from '../services/deleteCard';

export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      deleteCard(id, {
        cardRepository: getSQLiteCardRepository(),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: HOME_DATA_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ACTIVE_COLLECTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ACTIVE_DECKS_QUERY_KEY }),
        queryClient.resetQueries({ queryKey: DECK_CARDS_QUERY_KEY }),
      ]);
    },
  });
}
