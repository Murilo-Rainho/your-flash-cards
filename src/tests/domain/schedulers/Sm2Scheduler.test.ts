import { describe, expect, it } from '@jest/globals';

import { REVIEW_RATINGS, type ReviewRating } from '@/constants/reviewRatings';

import type { ReviewScheduleInput } from '@/domain/schedulers/ReviewScheduler';
import { SM2_SCHEDULER_TYPE, sm2Scheduler } from '@/domain/schedulers/Sm2Scheduler';

const REVIEWED_AT = new Date('2026-06-05T12:00:00.000Z');
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type State = { repetitions: number; intervalDays: number; easeFactor: number; lapses: number };

function run(before: State, rating: ReviewRating, reviewedAt: Date = REVIEWED_AT) {
  const input: ReviewScheduleInput = { ...before, rating, reviewedAt };
  return sm2Scheduler.schedule(input);
}

function deltaInDays(nextReviewAt: string, reviewedAt: Date = REVIEWED_AT): number {
  return (new Date(nextReviewAt).getTime() - reviewedAt.getTime()) / MS_PER_DAY;
}

type Case = {
  name: string;
  before: State;
  rating: ReviewRating;
  expected: State; // post-review state (ef/rep/int/lap)
};

const NEW_CARD: State = { repetitions: 0, intervalDays: 0, easeFactor: 2.5, lapses: 0 };

const CASES: Case[] = [
  {
    name: 'new card + Again: resets repetitions, increments lapse, interval 1, EF drops',
    before: NEW_CARD,
    rating: REVIEW_RATINGS.AGAIN,
    expected: { easeFactor: 2.18, repetitions: 0, intervalDays: 1, lapses: 1 },
  },
  {
    name: 'new card + Hard',
    before: NEW_CARD,
    rating: REVIEW_RATINGS.HARD,
    expected: { easeFactor: 2.36, repetitions: 1, intervalDays: 1, lapses: 0 },
  },
  {
    name: 'new card + Good',
    before: NEW_CARD,
    rating: REVIEW_RATINGS.GOOD,
    expected: { easeFactor: 2.5, repetitions: 1, intervalDays: 1, lapses: 0 },
  },
  {
    name: 'new card + Easy',
    before: NEW_CARD,
    rating: REVIEW_RATINGS.EASY,
    expected: { easeFactor: 2.6, repetitions: 1, intervalDays: 1, lapses: 0 },
  },
  {
    name: 'second review (Good) uses the 6-day step',
    before: { repetitions: 1, intervalDays: 1, easeFactor: 2.5, lapses: 0 },
    rating: REVIEW_RATINGS.GOOD,
    expected: { easeFactor: 2.5, repetitions: 2, intervalDays: 6, lapses: 0 },
  },
  {
    name: 'second review (Easy) applies bonus on top of the 6-day step',
    before: { repetitions: 1, intervalDays: 1, easeFactor: 2.5, lapses: 0 },
    rating: REVIEW_RATINGS.EASY,
    expected: { easeFactor: 2.6, repetitions: 2, intervalDays: 8, lapses: 0 },
  },
  {
    name: 'mature review (Good) multiplies by ease',
    before: { repetitions: 2, intervalDays: 6, easeFactor: 2.5, lapses: 0 },
    rating: REVIEW_RATINGS.GOOD,
    expected: { easeFactor: 2.5, repetitions: 3, intervalDays: 15, lapses: 0 },
  },
  {
    name: 'mature review (Hard) shortens the interval',
    before: { repetitions: 2, intervalDays: 6, easeFactor: 2.5, lapses: 0 },
    rating: REVIEW_RATINGS.HARD,
    expected: { easeFactor: 2.36, repetitions: 3, intervalDays: 7, lapses: 0 },
  },
  {
    name: 'lapse: Again on mature card resets repetitions and interval',
    before: { repetitions: 3, intervalDays: 15, easeFactor: 2.5, lapses: 0 },
    rating: REVIEW_RATINGS.AGAIN,
    expected: { easeFactor: 2.18, repetitions: 0, intervalDays: 1, lapses: 1 },
  },
  {
    name: 'ease saturated at floor 1.3 does not drop further (Hard)',
    before: { repetitions: 5, intervalDays: 100, easeFactor: 1.3, lapses: 4 },
    rating: REVIEW_RATINGS.HARD,
    expected: { easeFactor: 1.3, repetitions: 6, intervalDays: 120, lapses: 4 },
  },
];

describe('Sm2Scheduler', () => {
  it('exposes the "sm2" type', () => {
    expect(sm2Scheduler.type).toBe(SM2_SCHEDULER_TYPE);
    expect(SM2_SCHEDULER_TYPE).toBe('sm2');
  });

  it.each(CASES)('$name', ({ before, rating, expected }) => {
    const result = run(before, rating);

    expect(result.repetitions).toBe(expected.repetitions);
    expect(result.intervalDays).toBe(expected.intervalDays);
    expect(result.lapses).toBe(expected.lapses);
    expect(result.easeFactor).toBeCloseTo(expected.easeFactor, 5);
    // Day interval must match nextReviewAt exactly (preserves time of day).
    expect(deltaInDays(result.nextReviewAt)).toBe(expected.intervalDays);
  });

  it('preserves time of day in UTC ISO for the next review', () => {
    const result = run(NEW_CARD, REVIEW_RATINGS.AGAIN);
    expect(result.nextReviewAt).toBe('2026-06-06T12:00:00.000Z');
  });

  it('keeps ease factor at floor 1.3 even when failing repeatedly', () => {
    let state: State = { repetitions: 4, intervalDays: 50, easeFactor: 1.4, lapses: 0 };

    for (let i = 0; i < 5; i += 1) {
      const result = run(state, REVIEW_RATINGS.AGAIN);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
      expect(result.repetitions).toBe(0);
      expect(result.intervalDays).toBe(1);
      state = { ...state, easeFactor: result.easeFactor, lapses: result.lapses };
    }

    expect(state.easeFactor).toBe(1.3);
    expect(state.lapses).toBe(5);
  });

  it('never schedules a success for less than 1 day', () => {
    const ratings: ReviewRating[] = [REVIEW_RATINGS.HARD, REVIEW_RATINGS.GOOD, REVIEW_RATINGS.EASY];
    for (const rating of ratings) {
      const result = run(NEW_CARD, rating);
      expect(result.intervalDays).toBeGreaterThanOrEqual(1);
    }
  });

  it('is deterministic (same input → same output)', () => {
    expect(run(NEW_CARD, REVIEW_RATINGS.GOOD)).toEqual(run(NEW_CARD, REVIEW_RATINGS.GOOD));
  });

  it('produces exact day delta from a timestamp with timezone/DST', () => {
    // Built via local components (may fall near a DST transition in CI).
    const localReviewedAt = new Date(2026, 2, 8, 1, 30, 0);
    const result = run(
      { repetitions: 2, intervalDays: 6, easeFactor: 2.5, lapses: 0 },
      REVIEW_RATINGS.GOOD,
      localReviewedAt,
    );

    expect(new Date(result.nextReviewAt).getTime() - localReviewedAt.getTime()).toBe(
      15 * MS_PER_DAY,
    );
  });
});
