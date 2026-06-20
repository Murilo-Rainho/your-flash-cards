import { describe, expect, it } from '@jest/globals';

import { resolveStrings } from '@/strings';

import { REVIEW_RATING_ORDER, REVIEW_RATINGS } from './reviewRatings';

describe('reviewRatings', () => {
  it('exposes the 4 ratings from hardest to easiest', () => {
    expect(REVIEW_RATING_ORDER).toEqual([
      REVIEW_RATINGS.AGAIN,
      REVIEW_RATINGS.HARD,
      REVIEW_RATINGS.GOOD,
      REVIEW_RATINGS.EASY,
    ]);
  });

  it('maps friendly PT-BR labels via the string catalog (§19)', () => {
    expect(resolveStrings('pt-BR').review.ratings).toEqual({
      again: 'Errei',
      hard: 'Difícil',
      good: 'Médio',
      easy: 'Fácil',
    });
  });
});
