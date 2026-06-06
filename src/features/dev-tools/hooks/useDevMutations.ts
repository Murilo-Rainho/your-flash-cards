import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getSQLiteDevToolsRepository } from '@/infrastructure/database/sqlite/repositories';

import {
  clearAllReviewLogs,
  makeAllCardsDueNow,
  resetAllCardReviewState,
  resetCardReviewState,
} from '../services/resetCardReviewState';
import { DEV_CARDS_REVIEW_STATE_QUERY_KEY } from './useDevCardsWithReviewState';
import { DEV_TABLES_QUERY_KEY } from './useDevTables';

function createDevMutationOptions(queryClient: ReturnType<typeof useQueryClient>) {
  const devToolsRepository = getSQLiteDevToolsRepository();

  return {
    devToolsRepository,
    queryClient,
  };
}

async function refreshDevQueries(queryClient: ReturnType<typeof useQueryClient>): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: DEV_TABLES_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: DEV_CARDS_REVIEW_STATE_QUERY_KEY }),
  ]);
}

export function useDevMutations() {
  const queryClient = useQueryClient();
  const options = createDevMutationOptions(queryClient);

  const resetSelected = useMutation({
    mutationFn: (cardIds: string[]) => resetCardReviewState(cardIds, options),
    onSuccess: async () => {
      await refreshDevQueries(queryClient);
    },
  });

  const resetAll = useMutation({
    mutationFn: () => resetAllCardReviewState(options),
    onSuccess: async () => {
      await refreshDevQueries(queryClient);
    },
  });

  const makeAllDue = useMutation({
    mutationFn: () => makeAllCardsDueNow(options),
    onSuccess: async () => {
      await refreshDevQueries(queryClient);
    },
  });

  const clearLogs = useMutation({
    mutationFn: () => clearAllReviewLogs(options),
    onSuccess: async () => {
      await refreshDevQueries(queryClient);
    },
  });

  const isPending =
    resetSelected.isPending || resetAll.isPending || makeAllDue.isPending || clearLogs.isPending;

  return {
    resetSelected,
    resetAll,
    makeAllDue,
    clearLogs,
    isPending,
  };
}
