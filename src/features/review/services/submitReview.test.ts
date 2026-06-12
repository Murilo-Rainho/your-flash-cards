import { describe, expect, it } from '@jest/globals';

import { REVIEW_RATINGS } from '@/constants/reviewRatings';
import type { ReviewItem } from '@/domain/entities/ReviewItem';
import type { ReviewLog } from '@/domain/entities/ReviewLog';
import type { ApplyReviewInput, ReviewRepository } from '@/domain/repositories/ReviewRepository';
import { sm2Scheduler } from '@/domain/schedulers/Sm2Scheduler';

import { submitReview } from './submitReview';

function makeReviewItem(overrides: Partial<ReviewItem> = {}): ReviewItem {
  return {
    id: 'review-item-1',
    cardVariantId: 'variant-1',
    schedulerType: 'sm2',
    schedulerVersion: 'v1',
    repetitions: 2,
    intervalDays: 6,
    easeFactor: 2.5,
    nextReviewAt: '2026-06-01T10:00:00.000Z',
    lapses: 0,
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-26T10:00:00.000Z',
    ...overrides,
  };
}

function createFakeRepository() {
  const calls: ApplyReviewInput[] = [];
  const repository: ReviewRepository = {
    listDueReviewCards: async () => [],
    listReviewsForDay: async () => [],
    applyReview: async (input) => {
      calls.push(input);
      return {
        id: 'review-log-1',
        ...input,
        nextIntervalDays: input.result.intervalDays,
      } as unknown as ReviewLog;
    },
  };
  return { repository, calls };
}

describe('submitReview', () => {
  it('calcula o resultado via scheduler e persiste com os valores anteriores corretos', async () => {
    const { repository, calls } = createFakeRepository();
    const reviewItem = makeReviewItem({ repetitions: 2, intervalDays: 6, easeFactor: 2.5 });
    const now = new Date('2026-06-05T12:00:00.000Z');

    await submitReview(
      { reviewItem, rating: REVIEW_RATINGS.GOOD, timeSpentMs: 3000 },
      { reviewRepository: repository, scheduler: sm2Scheduler, now: () => now },
    );

    expect(calls).toHaveLength(1);
    const applied = calls[0];
    expect(applied.reviewItemId).toBe('review-item-1');
    expect(applied.rating).toBe('good');
    expect(applied.reviewedAt).toBe(now);
    expect(applied.timeSpentMs).toBe(3000);
    expect(applied.previousIntervalDays).toBe(6);
    expect(applied.previousEaseFactor).toBe(2.5);
    // SM-2 maduro + Médio: round(6 * 2.5) = 15, rep 3.
    expect(applied.result.intervalDays).toBe(15);
    expect(applied.result.repetitions).toBe(3);
    expect(applied.result.nextReviewAt).toBe('2026-06-20T12:00:00.000Z');
  });

  it('Errei reseta repetitions, soma lapse e reagenda para +1 dia', async () => {
    const { repository, calls } = createFakeRepository();
    const reviewItem = makeReviewItem({
      repetitions: 3,
      intervalDays: 15,
      easeFactor: 2.5,
      lapses: 0,
    });
    const now = new Date('2026-06-05T12:00:00.000Z');

    await submitReview(
      { reviewItem, rating: REVIEW_RATINGS.AGAIN, timeSpentMs: 1500 },
      { reviewRepository: repository, scheduler: sm2Scheduler, now: () => now },
    );

    expect(calls[0].result.repetitions).toBe(0);
    expect(calls[0].result.lapses).toBe(1);
    expect(calls[0].result.intervalDays).toBe(1);
    expect(calls[0].result.nextReviewAt).toBe('2026-06-06T12:00:00.000Z');
  });

  it('propaga o sessionId quando informado', async () => {
    const { repository, calls } = createFakeRepository();

    await submitReview(
      {
        reviewItem: makeReviewItem(),
        rating: REVIEW_RATINGS.EASY,
        timeSpentMs: 0,
        sessionId: 'session-9',
      },
      {
        reviewRepository: repository,
        scheduler: sm2Scheduler,
        now: () => new Date('2026-06-05T12:00:00.000Z'),
      },
    );

    expect(calls[0].sessionId).toBe('session-9');
  });
});
