import { resolveStrings } from '@/strings';

import { REVIEW_RATING_ORDER, REVIEW_RATINGS } from './reviewRatings';

describe('reviewRatings', () => {
  it('expõe as 4 avaliações na ordem do mais difícil ao mais fácil', () => {
    expect(REVIEW_RATING_ORDER).toEqual([
      REVIEW_RATINGS.AGAIN,
      REVIEW_RATINGS.HARD,
      REVIEW_RATINGS.GOOD,
      REVIEW_RATINGS.EASY,
    ]);
  });

  it('mapeia rótulos PT-BR amigáveis via catálogo de strings (§19)', () => {
    expect(resolveStrings('pt-BR').review.ratings).toEqual({
      again: 'Errei',
      hard: 'Difícil',
      good: 'Médio',
      easy: 'Fácil',
    });
  });
});
