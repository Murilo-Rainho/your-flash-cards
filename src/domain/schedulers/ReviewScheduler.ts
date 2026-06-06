import type { ReviewRating } from '@/constants/reviewRatings';

/**
 * Interface de agendamento de revisão (§18, §32.1).
 *
 * O algoritmo (SM-2 na V1) fica atrás desta porta para ser substituível no futuro (FSRS,
 * algoritmo por tipo de card etc.). É TypeScript puro: nada de React/Expo/SQLite. O scheduler
 * NÃO lê o relógio — recebe `reviewedAt` para permanecer determinístico e testável.
 */

/** Estado atual de scheduling do item + a avaliação do usuário. */
export type ReviewScheduleInput = {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  lapses: number;
  rating: ReviewRating;
  reviewedAt: Date;
};

/** Novo estado de scheduling calculado. `nextReviewAt` é ISO (igual a `ReviewItem`). */
export type ReviewScheduleResult = {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  lapses: number;
  nextReviewAt: string;
};

export type ReviewScheduler = {
  /** Identificador estável do algoritmo, persistido em `review_items.scheduler_type`. */
  type: string;
  schedule(input: ReviewScheduleInput): ReviewScheduleResult;
};
