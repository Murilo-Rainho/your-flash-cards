import { useQuery } from '@tanstack/react-query';

import { LIMITS } from '@/constants/limits';
import type { DueReviewCard } from '@/domain/repositories/ReviewRepository';
import { getSQLiteReviewRepository } from '@/infrastructure/database/sqlite/repositories';

export const REVIEW_DUE_QUERY_KEY = ['review', 'due'] as const;

/**
 * Carrega os cards vencidos da sessão (§20: `LIMIT`, nunca todos). A fila é "congelada" durante
 * a sessão (`staleTime: Infinity`) para não refazer o fetch a cada avaliação — o snapshot
 * inicial define a sessão; a Home é reatualizada na volta via invalidação no submit.
 */
export function useDueReviewCards() {
  return useQuery<DueReviewCard[], Error>({
    queryKey: REVIEW_DUE_QUERY_KEY,
    queryFn: () =>
      getSQLiteReviewRepository().listDueReviewCards({
        now: new Date(),
        limit: LIMITS.DEFAULT_REVIEW_SESSION_LIMIT,
      }),
    staleTime: Infinity,
    gcTime: 0,
  });
}
