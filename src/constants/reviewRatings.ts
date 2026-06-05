/**
 * As quatro avaliações da revisão (§19). Compartilhadas entre a UI de review
 * (`src/components/review`) e o futuro `ReviewScheduler` do domínio (§18, §32.1).
 *
 * Vive em `constants/` porque é um identificador estável importável tanto por
 * `components/` (UI burra) quanto por `domain/` — nenhuma das duas pode depender da outra.
 */
export const REVIEW_RATINGS = {
  AGAIN: 'again',
  HARD: 'hard',
  GOOD: 'good',
  EASY: 'easy',
} as const;

export type ReviewRating = (typeof REVIEW_RATINGS)[keyof typeof REVIEW_RATINGS];

/** Ordem de exibição dos botões (do mais difícil ao mais fácil). */
export const REVIEW_RATING_ORDER = [
  REVIEW_RATINGS.AGAIN,
  REVIEW_RATINGS.HARD,
  REVIEW_RATINGS.GOOD,
  REVIEW_RATINGS.EASY,
] as const;

/** Rótulos PT-BR amigáveis (§19: nunca apenas "acertei/errei"). */
export const REVIEW_RATING_LABELS: Record<ReviewRating, string> = {
  again: 'Errei',
  hard: 'Difícil',
  good: 'Médio',
  easy: 'Fácil',
};
