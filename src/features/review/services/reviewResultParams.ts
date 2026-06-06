import { REVIEW_RATINGS, type ReviewRating } from '@/constants/reviewRatings';

import type { SessionStats } from './reviewSessionStats';

/** Resumo da sessão serializado para params de rota (strings) — sem store global (offline). */
export type ReviewResultParams = {
  reviewed: string;
  correct: string;
  wrong: string;
  again: string;
  hard: string;
  good: string;
  easy: string;
  durationMs: string;
};

export type ReviewResultSummary = {
  reviewed: number;
  correct: number;
  wrong: number;
  byRating: Record<ReviewRating, number>;
  durationMs: number;
  /** false quando a tela foi aberta sem dados (ex.: deep-link direto). */
  hasData: boolean;
};

export function serializeReviewStats(stats: SessionStats): ReviewResultParams {
  const durationMs = stats.finishedAt ? Math.max(0, stats.finishedAt - stats.startedAt) : 0;

  return {
    reviewed: String(stats.reviewedCount),
    correct: String(stats.correct),
    wrong: String(stats.wrong),
    again: String(stats.byRating[REVIEW_RATINGS.AGAIN]),
    hard: String(stats.byRating[REVIEW_RATINGS.HARD]),
    good: String(stats.byRating[REVIEW_RATINGS.GOOD]),
    easy: String(stats.byRating[REVIEW_RATINGS.EASY]),
    durationMs: String(durationMs),
  };
}

function toInt(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseReviewResult(
  params: Record<string, string | string[] | undefined>,
): ReviewResultSummary {
  return {
    reviewed: toInt(params.reviewed),
    correct: toInt(params.correct),
    wrong: toInt(params.wrong),
    byRating: {
      [REVIEW_RATINGS.AGAIN]: toInt(params.again),
      [REVIEW_RATINGS.HARD]: toInt(params.hard),
      [REVIEW_RATINGS.GOOD]: toInt(params.good),
      [REVIEW_RATINGS.EASY]: toInt(params.easy),
    },
    durationMs: toInt(params.durationMs),
    hasData: params.reviewed !== undefined,
  };
}
