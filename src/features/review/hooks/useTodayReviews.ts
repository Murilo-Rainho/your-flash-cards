import { useQuery } from '@tanstack/react-query';

import type { DailyReviewedCard } from '@/domain/repositories/ReviewRepository';
import { getSQLiteReviewRepository } from '@/infrastructure/database/sqlite/repositories';

export const REVIEW_TODAY_QUERY_KEY = ['review', 'today'] as const;

/**
 * Histórico dos cards revisados hoje (§33 #12), com a nota final por card. Diferente da fila de
 * vencidos, deve refletir o estado atual ao abrir a tela — por isso não congela o cache.
 */
export function useTodayReviews() {
  return useQuery<DailyReviewedCard[], Error>({
    queryKey: REVIEW_TODAY_QUERY_KEY,
    queryFn: () => getSQLiteReviewRepository().listReviewsForDay(new Date()),
  });
}
