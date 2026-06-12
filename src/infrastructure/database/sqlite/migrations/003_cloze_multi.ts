import type { SqliteMigration } from './types';

/**
 * Suporte a múltiplas lacunas e múltiplas respostas por lacuna no cloze (§9).
 *
 * Adiciona a coluna `cloze_data` (JSON do `ClozeContent`) como fonte da verdade do conteúdo
 * cloze. Aditiva e anulável: cards cloze antigos ficam com `cloze_data = NULL` e são lidos
 * derivando 1 lacuna/1 resposta de `front`/`back` (bridge legado) — sem backfill.
 */
export const clozeMultiMigration: SqliteMigration = {
  version: '003_cloze_multi',
  description: 'Add structured cloze_data column to support multiple blanks and answers.',
  statements: ['ALTER TABLE cards ADD COLUMN cloze_data TEXT'],
} as const;
