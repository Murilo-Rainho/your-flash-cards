import type { ReviewRating } from '@/constants/reviewRatings';
import type { ReviewItem } from '@/domain/entities/ReviewItem';
import type { ReviewLog } from '@/domain/entities/ReviewLog';
import type { ReviewRepository } from '@/domain/repositories/ReviewRepository';
import type { ReviewScheduler } from '@/domain/schedulers/ReviewScheduler';

export type SubmitReviewInput = {
  /** Full due item state (already in session — avoids re-reading DB). */
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
 * Applies a rating (§19, §35): `rating` enters `ReviewScheduler` (which branches
 * Again/Hard/Good/Easy), and the result is persisted atomically (updates `ReviewItem`
 * and writes `ReviewLog`). UI-free: receives repository/scheduler/clock by injection.
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
