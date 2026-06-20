import type { ReviewRating } from '@/constants/reviewRatings';
import { REVIEW_RATINGS } from '@/constants/reviewRatings';
import type { DueReviewCard } from '@/domain/repositories/ReviewRepository';

import { applyRating, emptyStats, finishStats, type SessionStats } from './reviewSessionStats';

/**
 * Pure review session state machine (§21, §35). No React.
 *
 * Queue is FIFO; "Again" re-enqueues the card at the END (Anki-style) without changing `total`
 * (distinct cards). Good/Hard/Easy remove the card. Session ends when the queue is empty.
 */
export type ReviewSessionState = {
  initialized: boolean;
  queue: DueReviewCard[];
  /** Distinct cards in the session (unchanged by "Again" re-enqueues). */
  total: number;
  finished: boolean;
  stats: SessionStats;
};

export type ReviewSessionAction =
  | { type: 'INIT'; cards: DueReviewCard[]; now: number }
  | { type: 'RATE'; rating: ReviewRating; now: number };

export const initialReviewSessionState: ReviewSessionState = {
  initialized: false,
  queue: [],
  total: 0,
  finished: false,
  stats: emptyStats(0),
};

export function reviewSessionReducer(
  state: ReviewSessionState,
  action: ReviewSessionAction,
): ReviewSessionState {
  switch (action.type) {
    case 'INIT': {
      return {
        initialized: true,
        queue: action.cards,
        total: action.cards.length,
        finished: action.cards.length === 0,
        stats: emptyStats(action.now),
      };
    }
    case 'RATE': {
      const [current, ...rest] = state.queue;
      if (!current) {
        return state;
      }

      // "Again" repeats the card at the end of the same session; other ratings finish it.
      const queue = action.rating === REVIEW_RATINGS.AGAIN ? [...rest, current] : rest;
      const finished = queue.length === 0;
      const ratedStats = applyRating(state.stats, action.rating);

      return {
        ...state,
        queue,
        finished,
        stats: finished ? finishStats(ratedStats, action.now) : ratedStats,
      };
    }
    default:
      return state;
  }
}

/** Currently displayed card (queue head), or null when the session is done. */
export function currentCard(state: ReviewSessionState): DueReviewCard | null {
  return state.queue[0] ?? null;
}

/** 1-indexed position of the current distinct card for the progress bar. */
export function currentProgress(state: ReviewSessionState): { current: number; total: number } {
  if (state.total === 0) {
    return { current: 0, total: 0 };
  }
  const current = state.finished
    ? state.total
    : Math.min(state.total, state.total - state.queue.length + 1);
  return { current, total: state.total };
}
