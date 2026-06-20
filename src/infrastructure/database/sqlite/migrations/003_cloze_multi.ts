import type { SqliteMigration } from './types';

/**
 * Support for multiple blanks and multiple answers per blank in cloze (§9).
 *
 * Adds `cloze_data` column (JSON of `ClozeContent`) as source of truth for cloze
 * content. Additive and nullable: legacy cloze cards keep `cloze_data = NULL` and are read
 * by deriving 1 blank/1 answer from `front`/`back` (legacy bridge) — no backfill.
 */
export const clozeMultiMigration: SqliteMigration = {
  version: '003_cloze_multi',
  description: 'Add structured cloze_data column to support multiple blanks and answers.',
  statements: ['ALTER TABLE cards ADD COLUMN cloze_data TEXT'],
} as const;
