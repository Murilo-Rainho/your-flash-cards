import { describe, expect, it } from '@jest/globals';

import { CARD_TYPES } from '@/constants/cardTypes';
import { REVIEW_RATINGS } from '@/constants/reviewRatings';
import { VARIANT_TYPES } from '@/domain/entities/CardVariant';
import type { DueReviewCard } from '@/domain/repositories/ReviewRepository';

import {
  currentCard,
  currentProgress,
  initialReviewSessionState,
  reviewSessionReducer,
  type ReviewSessionState,
} from '@/features/review/services/reviewSessionReducer';

function makeCard(id: string): DueReviewCard {
  return {
    reviewItem: {
      id: `review-item-${id}`,
      cardVariantId: `variant-${id}`,
      schedulerType: 'sm2',
      schedulerVersion: 'v1',
      repetitions: 0,
      intervalDays: 0,
      easeFactor: 2.5,
      nextReviewAt: '2026-06-01T10:00:00.000Z',
      lapses: 0,
      createdAt: '2026-05-01T10:00:00.000Z',
      updatedAt: '2026-05-01T10:00:00.000Z',
    },
    cardId: id,
    cardType: CARD_TYPES.VOCABULARY,
    front: id,
    back: id,
    variantType: VARIANT_TYPES.ORIGINAL,
    media: [],
  };
}

function init(ids: string[]): ReviewSessionState {
  return reviewSessionReducer(initialReviewSessionState, {
    type: 'INIT',
    cards: ids.map(makeCard),
    now: 1000,
  });
}

describe('reviewSessionReducer', () => {
  it('INIT sets queue, total and start; empty finishes immediately', () => {
    const state = init(['a', 'b']);
    expect(state.initialized).toBe(true);
    expect(state.total).toBe(2);
    expect(state.finished).toBe(false);
    expect(currentCard(state)?.cardId).toBe('a');

    const empty = init([]);
    expect(empty.initialized).toBe(true);
    expect(empty.total).toBe(0);
    expect(empty.finished).toBe(true);
    expect(currentCard(empty)).toBeNull();
  });

  it('Good advances and removes the card from the queue', () => {
    let state = init(['a', 'b']);
    state = reviewSessionReducer(state, { type: 'RATE', rating: REVIEW_RATINGS.GOOD, now: 2000 });

    expect(currentCard(state)?.cardId).toBe('b');
    expect(state.queue).toHaveLength(1);
    expect(state.finished).toBe(false);
    expect(state.stats.reviewedCount).toBe(1);
  });

  it('Again re-enqueues the card at the end without changing the total', () => {
    let state = init(['a', 'b']);
    state = reviewSessionReducer(state, { type: 'RATE', rating: REVIEW_RATINGS.AGAIN, now: 2000 });

    expect(currentCard(state)?.cardId).toBe('b');
    expect(state.queue.map((c) => c.cardId)).toEqual(['b', 'a']);
    expect(state.total).toBe(2);
    expect(state.finished).toBe(false);
    expect(state.stats.byRating.again).toBe(1);
  });

  it('finishes when the queue empties and sets finishedAt', () => {
    let state = init(['a']);
    state = reviewSessionReducer(state, { type: 'RATE', rating: REVIEW_RATINGS.GOOD, now: 5000 });

    expect(state.finished).toBe(true);
    expect(currentCard(state)).toBeNull();
    expect(state.stats.finishedAt).toBe(5000);
  });

  it('progress reflects distinct cards completed, ignoring re-enqueues', () => {
    let state = init(['a', 'b', 'c']);
    expect(currentProgress(state)).toEqual({ current: 1, total: 3 });

    state = reviewSessionReducer(state, { type: 'RATE', rating: REVIEW_RATINGS.AGAIN, now: 2000 });
    // "Again" does not advance distinct progress.
    expect(currentProgress(state)).toEqual({ current: 1, total: 3 });

    state = reviewSessionReducer(state, { type: 'RATE', rating: REVIEW_RATINGS.GOOD, now: 3000 });
    expect(currentProgress(state)).toEqual({ current: 2, total: 3 });
  });
});
