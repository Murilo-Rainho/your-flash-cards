import { describe, expect, it } from '@jest/globals';

import { countConsecutiveReviewDays, startOfLocalDay, toLocalDateKey } from '@/utils/date';

describe('date utils', () => {
  it('formats a local date key', () => {
    expect(toLocalDateKey(new Date(2026, 5, 3, 12, 0, 0))).toBe('2026-06-03');
  });

  it('returns the local start of day', () => {
    expect(startOfLocalDay(new Date(2026, 5, 3, 12, 30, 0))).toEqual(new Date(2026, 5, 3, 0, 0, 0));
  });

  it('counts consecutive review days including today', () => {
    const now = new Date(2026, 5, 3, 12, 0, 0);
    const reviewedAtValues = [
      new Date(2026, 5, 3, 9, 0, 0).toISOString(),
      new Date(2026, 5, 2, 9, 0, 0).toISOString(),
      new Date(2026, 5, 1, 9, 0, 0).toISOString(),
      new Date(2026, 4, 30, 9, 0, 0).toISOString(),
    ];

    expect(countConsecutiveReviewDays(reviewedAtValues, now)).toBe(3);
  });

  it('keeps yesterday streak alive when today has no review yet', () => {
    const now = new Date(2026, 5, 3, 12, 0, 0);
    const reviewedAtValues = [
      new Date(2026, 5, 2, 9, 0, 0).toISOString(),
      new Date(2026, 5, 1, 9, 0, 0).toISOString(),
    ];

    expect(countConsecutiveReviewDays(reviewedAtValues, now)).toBe(2);
  });

  it('returns zero when the streak is broken', () => {
    const now = new Date(2026, 5, 3, 12, 0, 0);
    const reviewedAtValues = ['not-a-date', new Date(2026, 4, 31, 9, 0, 0).toISOString()];

    expect(countConsecutiveReviewDays(reviewedAtValues, now)).toBe(0);
  });
});
