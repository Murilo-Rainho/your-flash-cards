/**
 * DailyStudySummary — read-model do resumo diário exibido na Home (§22).
 *
 * Apenas dados derivados (de `ReviewLog`/`ReviewItem`), calculados localmente no futuro
 * (offline-first, §29). TS puro: sem dependências de UI/infra.
 */
export type DailyStudySummary = {
  /** Cards com `nextReviewAt <= now` (vencidos) prontos para revisão hoje (§20). */
  dueCards: number;
  /** Cards marcados como difíceis nas últimas revisões. */
  difficultCards: number;
  /** Cards revisados hoje. */
  reviewedToday: number;
  /** Taxa de retenção (0–100). */
  retentionPercentage: number;
  /** Dias consecutivos com revisão (streak). */
  streakDays: number;
  /** Total de cards considerados dominados. */
  masteredCards: number;
};
