import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getSQLiteCardRepository,
  getSQLiteDeckRepository,
} from '@/infrastructure/database/sqlite/repositories';
import { getExpoLocalMediaStorage } from '@/infrastructure/filesystem/ExpoLocalMediaStorage';
import { ACTIVE_COLLECTIONS_QUERY_KEY } from '@/features/collections/hooks/useActiveCollections';
import { ACTIVE_DECKS_QUERY_KEY } from '@/features/decks/hooks/useActiveDecks';
import { CARD_AGGREGATE_QUERY_KEY } from '@/features/cards/hooks/useCardAggregate';
import { DECK_CARDS_QUERY_KEY } from '@/features/cards/hooks/useDeckCards';
import { HOME_DATA_QUERY_KEY } from '@/features/home/hooks/useHomeData';

import { updateCard, type UpdateCardInput } from '../services/updateCard';

export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCardInput) =>
      updateCard(input, {
        cardRepository: getSQLiteCardRepository(),
        deckRepository: getSQLiteDeckRepository(),
        mediaStorage: getExpoLocalMediaStorage(),
      }),
    onSuccess: async (aggregate) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: HOME_DATA_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ACTIVE_COLLECTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ACTIVE_DECKS_QUERY_KEY }),
        queryClient.resetQueries({ queryKey: DECK_CARDS_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: [...CARD_AGGREGATE_QUERY_KEY, aggregate.card.id],
        }),
      ]);
    },
  });
}
