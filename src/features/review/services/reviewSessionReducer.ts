import type { ReviewRating } from '@/constants/reviewRatings';
import { REVIEW_RATINGS } from '@/constants/reviewRatings';
import type { DueReviewCard } from '@/domain/repositories/ReviewRepository';

import { applyRating, emptyStats, finishStats, type SessionStats } from './reviewSessionStats';

/**
 * Máquina de estado pura da sessão de revisão (§21, §35). Sem React.
 *
 * A fila é FIFO; "Errei" re-enfileira o card no FIM (estilo Anki) sem alterar `total` (cards
 * distintos). Acertos/Difícil removem o card. A sessão termina quando a fila esvazia.
 */
export type ReviewSessionState = {
  initialized: boolean;
  queue: DueReviewCard[];
  /** Cards distintos da sessão (não muda com re-enfileiramentos de "Errei"). */
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

      // "Errei" repete o card no fim da mesma sessão; demais avaliações o concluem.
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

/** Card atualmente exibido (topo da fila), ou null quando a sessão acabou. */
export function currentCard(state: ReviewSessionState): DueReviewCard | null {
  return state.queue[0] ?? null;
}

/** Posição 1-indexada do card distinto atual para a barra de progresso. */
export function currentProgress(state: ReviewSessionState): { current: number; total: number } {
  if (state.total === 0) {
    return { current: 0, total: 0 };
  }
  const current = state.finished
    ? state.total
    : Math.min(state.total, state.total - state.queue.length + 1);
  return { current, total: state.total };
}
