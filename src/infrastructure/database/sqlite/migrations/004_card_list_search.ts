import { normalizeSearchText } from '@/utils/search';

import type { SqliteDatabaseConnection } from '../types';
import type { SqliteMigration } from './types';

const BACKFILL_BATCH_SIZE = 200;

type CardSearchRow = {
  id: string;
  front: string;
  back: string;
};

/** Preenche as projeções de busca sem carregar todos os cards existentes em memória. */
export async function backfillCardSearchProjections(db: SqliteDatabaseConnection): Promise<void> {
  let lastId: string | null = null;

  while (true) {
    const rows: CardSearchRow[] = await db.getAllAsync<CardSearchRow>(
      `
SELECT id, front, back
FROM cards
WHERE ($lastId IS NULL OR id > $lastId)
ORDER BY id ASC
LIMIT $limit
`,
      { $lastId: lastId, $limit: BACKFILL_BATCH_SIZE },
    );

    if (rows.length === 0) {
      return;
    }

    for (const row of rows) {
      await db.runAsync(
        `
UPDATE cards
SET front_search = $frontSearch,
    back_search = $backSearch
WHERE id = $id
`,
        {
          $id: row.id,
          $frontSearch: normalizeSearchText(row.front),
          $backSearch: normalizeSearchText(row.back),
        },
      );
    }

    lastId = rows[rows.length - 1]?.id ?? null;
  }
}

export const cardListSearchMigration: SqliteMigration = {
  version: '004_card_list_search',
  description: 'Add normalized card search projections and stable list pagination index.',
  statements: [
    "ALTER TABLE cards ADD COLUMN front_search TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE cards ADD COLUMN back_search TEXT NOT NULL DEFAULT ''",
  ],
  migrateData: backfillCardSearchProjections,
  finalizeStatements: [
    `
CREATE INDEX IF NOT EXISTS idx_cards_deck_active_order
ON cards (deck_id, archived_at, updated_at DESC, created_at DESC, id DESC)
`,
  ],
} as const;
