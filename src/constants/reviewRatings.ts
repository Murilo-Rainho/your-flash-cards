/**
 * The four review ratings (§19). Shared between the review UI
 * (`src/components/review`) and the domain `ReviewScheduler` (§18, §32.1).
 *
 * Lives in `constants/` because it is a stable identifier importable by both
 * `components/` (dumb UI) and `domain/` — neither may depend on the other.
 */
export const REVIEW_RATINGS = {
  AGAIN: 'again',
  HARD: 'hard',
  GOOD: 'good',
  EASY: 'easy',
} as const;

export type ReviewRating = (typeof REVIEW_RATINGS)[keyof typeof REVIEW_RATINGS];

/** Button display order (hardest to easiest). */
export const REVIEW_RATING_ORDER = [
  REVIEW_RATINGS.AGAIN,
  REVIEW_RATINGS.HARD,
  REVIEW_RATINGS.GOOD,
  REVIEW_RATINGS.EASY,
] as const;
