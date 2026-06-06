import { REVIEW_RATINGS } from '@/constants/reviewRatings';

import { applyRating, emptyStats, finishStats } from './reviewSessionStats';

describe('reviewSessionStats', () => {
  it('começa zerado com o início registrado', () => {
    const stats = emptyStats(1000);

    expect(stats).toEqual({
      reviewedCount: 0,
      byRating: { again: 0, hard: 0, good: 0, easy: 0 },
      correct: 0,
      wrong: 0,
      startedAt: 1000,
    });
  });

  it('contabiliza por avaliação e separa acertos (good/easy) de erros (again)', () => {
    let stats = emptyStats(0);
    stats = applyRating(stats, REVIEW_RATINGS.GOOD);
    stats = applyRating(stats, REVIEW_RATINGS.EASY);
    stats = applyRating(stats, REVIEW_RATINGS.HARD);
    stats = applyRating(stats, REVIEW_RATINGS.AGAIN);
    stats = applyRating(stats, REVIEW_RATINGS.AGAIN);

    expect(stats.reviewedCount).toBe(5);
    expect(stats.byRating).toEqual({ again: 2, hard: 1, good: 1, easy: 1 });
    expect(stats.correct).toBe(2);
    expect(stats.wrong).toBe(2);
  });

  it('não muta o estado anterior (imutável)', () => {
    const base = emptyStats(0);
    const next = applyRating(base, REVIEW_RATINGS.GOOD);

    expect(base.reviewedCount).toBe(0);
    expect(next.reviewedCount).toBe(1);
    expect(next.byRating).not.toBe(base.byRating);
  });

  it('marca o término', () => {
    const stats = finishStats(emptyStats(0), 5000);
    expect(stats.finishedAt).toBe(5000);
  });
});
