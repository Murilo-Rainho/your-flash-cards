import { describe, expect, it } from '@jest/globals';

import { REVIEW_RATINGS } from '@/constants/reviewRatings';

import {
  parseReviewResult,
  serializeReviewStats,
} from '@/features/review/services/reviewResultParams';
import {
  applyRating,
  emptyStats,
  finishStats,
} from '@/features/review/services/reviewSessionStats';

describe('reviewResultParams', () => {
  it('serializes and re-parses stats (round-trip)', () => {
    let stats = emptyStats(1000);
    stats = applyRating(stats, REVIEW_RATINGS.GOOD);
    stats = applyRating(stats, REVIEW_RATINGS.AGAIN);
    stats = applyRating(stats, REVIEW_RATINGS.EASY);
    stats = finishStats(stats, 6000);

    const summary = parseReviewResult(serializeReviewStats(stats));

    expect(summary).toEqual({
      reviewed: 3,
      correct: 2,
      wrong: 1,
      byRating: { again: 1, hard: 0, good: 1, easy: 1 },
      durationMs: 5000,
      hasData: true,
    });
  });

  it('sets hasData=false when there are no params (direct deep link)', () => {
    expect(parseReviewResult({}).hasData).toBe(false);
  });
});
