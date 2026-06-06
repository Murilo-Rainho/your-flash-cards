import type { ReviewRating } from '@/constants/reviewRatings';
import type { ReviewItem } from '@/domain/entities/ReviewItem';
import type { ReviewLog } from '@/domain/entities/ReviewLog';
import type { ReviewRepository } from '@/domain/repositories/ReviewRepository';
import type { ReviewScheduler } from '@/domain/schedulers/ReviewScheduler';

export type SubmitReviewInput = {
  /** Estado completo do item vencido (já em mãos na sessão — evita reler o banco). */
  reviewItem: ReviewItem;
  rating: ReviewRating;
  timeSpentMs: number;
  sessionId?: string;
};

export type SubmitReviewOptions = {
  reviewRepository: ReviewRepository;
  scheduler: ReviewScheduler;
  now?: () => Date;
};

/**
 * Aplica uma avaliação (§19, §35): o `rating` entra no `ReviewScheduler` (que ramifica
 * Errei/Difícil/Médio/Fácil), e o resultado é persistido atomicamente (atualiza o `ReviewItem`
 * e grava o `ReviewLog`). É puro de UI: recebe repositório/scheduler/relógio por injeção.
 */
export async function submitReview(
  input: SubmitReviewInput,
  { reviewRepository, scheduler, now = () => new Date() }: SubmitReviewOptions,
): Promise<ReviewLog> {
  const reviewedAt = now();
  const { reviewItem } = input;

  const result = scheduler.schedule({
    repetitions: reviewItem.repetitions,
    intervalDays: reviewItem.intervalDays,
    easeFactor: reviewItem.easeFactor,
    lapses: reviewItem.lapses,
    rating: input.rating,
    reviewedAt,
  });

  return reviewRepository.applyReview({
    reviewItemId: reviewItem.id,
    rating: input.rating,
    reviewedAt,
    timeSpentMs: input.timeSpentMs,
    sessionId: input.sessionId,
    previousIntervalDays: reviewItem.intervalDays,
    previousEaseFactor: reviewItem.easeFactor,
    result,
  });
}
