/**
 * DailyStudySummary — daily summary read-model shown on Home (§22).
 *
 * Derived data only (from `ReviewLog`/`ReviewItem`), computed locally in the future
 * (offline-first, §29). Pure TS: no UI/infra dependencies.
 */
export type DailyStudySummary = {
  /** Cards with `nextReviewAt <= now` (due) ready for review today (§20). */
  dueCards: number;
  /** Cards marked as difficult in recent reviews. */
  difficultCards: number;
  /** Cards reviewed today. */
  reviewedToday: number;
  /** Retention rate (0–100). */
  retentionPercentage: number;
  /** Consecutive days with review (streak). */
  streakDays: number;
  /** Total cards considered mastered. */
  masteredCards: number;
};
