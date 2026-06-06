import { REVIEW_RATINGS, type ReviewRating } from '@/constants/reviewRatings';

import type { ReviewScheduleInput, ReviewScheduleResult, ReviewScheduler } from './ReviewScheduler';

/**
 * Implementação SM-2 (§18, §20). Pura e determinística — sem I/O e sem relógio interno.
 *
 * Cada avaliação (Errei/Difícil/Médio/Fácil → again/hard/good/easy) ramifica aqui e afeta
 * `intervalDays`, `easeFactor`, `repetitions`, `lapses` e `nextReviewAt` (§19). Mantida atrás
 * da interface `ReviewScheduler` para ser substituível (FSRS etc.) no futuro.
 */

export const SM2_SCHEDULER_TYPE = 'sm2';

const MIN_EASE_FACTOR = 1.3;
const HARD_INTERVAL_MULTIPLIER = 1.2;
const EASY_BONUS = 1.3;
const FIRST_INTERVAL_DAYS = 1;
const SECOND_INTERVAL_DAYS = 6;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Escala 0..5 do SM-2. Abaixo de 3 é falha (apenas "Errei"). */
const RATING_QUALITY: Record<ReviewRating, number> = {
  [REVIEW_RATINGS.AGAIN]: 2,
  [REVIEW_RATINGS.HARD]: 3,
  [REVIEW_RATINGS.GOOD]: 4,
  [REVIEW_RATINGS.EASY]: 5,
};

/** EF' = EF + (0.1 − (5−q)·(0.08 + (5−q)·0.02)), com piso 1.3. Aplica-se a todas as avaliações. */
function nextEaseFactor(easeFactor: number, quality: number): number {
  const delta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  return Math.max(MIN_EASE_FACTOR, easeFactor + delta);
}

function addDaysIso(reviewedAt: Date, intervalDays: number): string {
  // Aritmética em ms + UTC ISO: alinha com a query de vencidos (também ISO) e evita bugs de
  // fuso/DST que `addLocalDays` (meia-noite local) introduziria.
  return new Date(reviewedAt.getTime() + intervalDays * MS_PER_DAY).toISOString();
}

function computeInterval(
  rating: ReviewRating,
  previousReps: number,
  previousInterval: number,
  ease: number,
): number {
  if (rating === REVIEW_RATINGS.AGAIN) {
    return FIRST_INTERVAL_DAYS;
  }

  if (previousReps === 0) {
    return FIRST_INTERVAL_DAYS;
  }

  if (rating === REVIEW_RATINGS.HARD) {
    return Math.max(previousInterval + 1, Math.round(previousInterval * HARD_INTERVAL_MULTIPLIER));
  }

  if (rating === REVIEW_RATINGS.EASY) {
    if (previousReps === 1) {
      return Math.round(SECOND_INTERVAL_DAYS * EASY_BONUS);
    }
    return Math.round(previousInterval * ease * EASY_BONUS);
  }

  // GOOD: degraus canônicos do SM-2.
  if (previousReps === 1) {
    return SECOND_INTERVAL_DAYS;
  }
  return Math.round(previousInterval * ease);
}

export const sm2Scheduler: ReviewScheduler = {
  type: SM2_SCHEDULER_TYPE,
  schedule(input: ReviewScheduleInput): ReviewScheduleResult {
    const { rating, repetitions, intervalDays, easeFactor, lapses, reviewedAt } = input;
    const quality = RATING_QUALITY[rating];
    const isFailure = rating === REVIEW_RATINGS.AGAIN;

    const nextEase = nextEaseFactor(easeFactor, quality);
    const nextReps = isFailure ? 0 : repetitions + 1;
    const nextLapses = isFailure ? lapses + 1 : lapses;
    const nextInterval = Math.max(1, computeInterval(rating, repetitions, intervalDays, nextEase));

    return {
      repetitions: nextReps,
      intervalDays: nextInterval,
      easeFactor: nextEase,
      lapses: nextLapses,
      nextReviewAt: addDaysIso(reviewedAt, nextInterval),
    };
  },
};
