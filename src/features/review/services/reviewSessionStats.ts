import { REVIEW_RATINGS, type ReviewRating } from '@/constants/reviewRatings';

/**
 * Accumulated review session statistics (§22), pure and testable.
 *
 * `reviewedCount` counts recorded ratings (an Again repeat counts again).
 * `correct` = Good+Easy; `wrong` = Again (Hard is a difficult success, not wrong).
 */
export type SessionStats = {
  reviewedCount: number;
  byRating: Record<ReviewRating, number>;
  correct: number;
  wrong: number;
  startedAt: number;
  finishedAt?: number;
};

export function emptyStats(now: number): SessionStats {
  return {
    reviewedCount: 0,
    byRating: {
      [REVIEW_RATINGS.AGAIN]: 0,
      [REVIEW_RATINGS.HARD]: 0,
      [REVIEW_RATINGS.GOOD]: 0,
      [REVIEW_RATINGS.EASY]: 0,
    },
    correct: 0,
    wrong: 0,
    startedAt: now,
  };
}

export function applyRating(stats: SessionStats, rating: ReviewRating): SessionStats {
  const isCorrect = rating === REVIEW_RATINGS.GOOD || rating === REVIEW_RATINGS.EASY;
  const isWrong = rating === REVIEW_RATINGS.AGAIN;

  return {
    ...stats,
    reviewedCount: stats.reviewedCount + 1,
    byRating: { ...stats.byRating, [rating]: stats.byRating[rating] + 1 },
    correct: stats.correct + (isCorrect ? 1 : 0),
    wrong: stats.wrong + (isWrong ? 1 : 0),
  };
}

export function finishStats(stats: SessionStats, now: number): SessionStats {
  return { ...stats, finishedAt: now };
}
