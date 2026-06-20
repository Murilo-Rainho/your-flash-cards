import type { ReviewRating } from '@/constants/reviewRatings';

/**
 * Immutable record of a review rating (§19, §30.10).
 *
 * Mirrors the `review_logs` table in camelCase. Stores scheduling before/after for statistics
 * (§22) and audit, without depending on the concrete algorithm. `sessionId` is optional (the
 * table allows NULL) and is an extension point for `study_sessions`.
 */
export type ReviewLog = {
  id: string;
  reviewItemId: string;
  sessionId?: string;
  rating: ReviewRating;
  reviewedAt: string;
  timeSpentMs: number;
  previousIntervalDays: number;
  nextIntervalDays: number;
  previousEaseFactor: number;
  nextEaseFactor: number;
};
