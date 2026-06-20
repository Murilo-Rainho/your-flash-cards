import type { ReviewRating } from '@/constants/reviewRatings';

/**
 * Review scheduling interface (§18, §32.1).
 *
 * The algorithm (SM-2 in V1) sits behind this port for future swap (FSRS, per-card-type
 * algorithm, etc.). Pure TypeScript: no React/Expo/SQLite. The scheduler does NOT read the
 * clock — it receives `reviewedAt` to stay deterministic and testable.
 */

/** Current scheduling state of the item + the user's rating. */
export type ReviewScheduleInput = {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  lapses: number;
  rating: ReviewRating;
  reviewedAt: Date;
};

/** New computed scheduling state. `nextReviewAt` is ISO (same as `ReviewItem`). */
export type ReviewScheduleResult = {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  lapses: number;
  nextReviewAt: string;
};

export type ReviewScheduler = {
  /** Stable algorithm identifier, persisted in `review_items.scheduler_type`. */
  type: string;
  schedule(input: ReviewScheduleInput): ReviewScheduleResult;
};
