import { REVIEW_RATINGS, type ReviewRating } from '@/constants/reviewRatings';

/**
 * Estatísticas acumuladas de uma sessão de revisão (§22), puras e testáveis.
 *
 * `reviewedCount` conta avaliações registradas (uma repetição de "Errei" conta de novo).
 * `correct` = Médio+Fácil; `wrong` = Errei (Difícil é acerto difícil, não erro).
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
