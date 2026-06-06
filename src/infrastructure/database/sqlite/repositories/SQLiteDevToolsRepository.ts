import { INITIAL_REVIEW_ITEM_STATE } from '@/domain/constants/initialReviewItemState';
import type { VariantType } from '@/domain/entities/CardVariant';

import type { SqliteDatabaseConnection } from '../types';

type GetDatabase = () => Promise<SqliteDatabaseConnection>;

export type DevTableSummary = {
  name: string;
  rowCount: number;
};

export type DevTableRowsParams = {
  limit: number;
  offset: number;
};

export type DevCardVariantReviewState = {
  cardVariantId: string;
  variantType: VariantType;
  reviewItemId: string;
  repetitions: number;
  lapses: number;
  easeFactor: number;
  nextReviewAt: string;
  lastReviewedAt?: string;
  logCount: number;
};

export type DevCardReviewState = {
  cardId: string;
  front: string;
  back: string;
  variants: DevCardVariantReviewState[];
};

type TableNameRow = {
  name: string;
};

type CountRow = {
  value: number;
};

type CardReviewRow = {
  cardId: string;
  front: string;
  back: string;
  cardVariantId: string;
  variantType: VariantType;
  reviewItemId: string;
  repetitions: number;
  lapses: number;
  easeFactor: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  logCount: number;
};

const TABLE_NAME_PATTERN = /^[a-z_][a-z0-9_]*$/i;

function buildInClause(
  ids: string[],
  prefix: string,
): { clause: string; params: Record<string, string> } {
  const params: Record<string, string> = {};

  const placeholders = ids.map((id, index) => {
    const key = `$${prefix}${index}`;
    params[key] = id;
    return key;
  });

  return {
    clause: placeholders.join(', '),
    params,
  };
}

export class SQLiteDevToolsRepository {
  private knownTables = new Set<string>();

  constructor(private readonly getDatabase: GetDatabase) {}

  async listTables(): Promise<DevTableSummary[]> {
    const db = await this.getDatabase();
    const tableRows = await db.getAllAsync<TableNameRow>(
      `SELECT name
       FROM sqlite_master
       WHERE type = 'table'
         AND name NOT LIKE 'sqlite_%'
       ORDER BY name ASC`,
    );

    this.knownTables = new Set(tableRows.map((row) => row.name));

    const summaries = await Promise.all(
      tableRows.map(async (row) => {
        const countRow = await db.getFirstAsync<CountRow>(
          `SELECT COUNT(*) AS value FROM ${row.name}`,
        );

        return {
          name: row.name,
          rowCount: countRow?.value ?? 0,
        };
      }),
    );

    return summaries;
  }

  async listTableRows(
    tableName: string,
    params: DevTableRowsParams,
  ): Promise<Record<string, unknown>[]> {
    const validatedTableName = await this.assertKnownTable(tableName);
    const db = await this.getDatabase();

    const rows = await db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM ${validatedTableName} LIMIT $limit OFFSET $offset`,
      { $limit: params.limit, $offset: params.offset },
    );

    return rows;
  }

  async listCardsWithReviewState(): Promise<DevCardReviewState[]> {
    const db = await this.getDatabase();
    const rows = await db.getAllAsync<CardReviewRow>(
      `SELECT
         c.id AS cardId,
         c.front,
         c.back,
         cv.id AS cardVariantId,
         cv.variant_type AS variantType,
         ri.id AS reviewItemId,
         ri.repetitions,
         ri.lapses,
         ri.ease_factor AS easeFactor,
         ri.next_review_at AS nextReviewAt,
         ri.last_reviewed_at AS lastReviewedAt,
         (
           SELECT COUNT(*)
           FROM review_logs rl
           WHERE rl.review_item_id = ri.id
         ) AS logCount
       FROM cards c
       INNER JOIN card_variants cv ON cv.card_id = c.id
       INNER JOIN review_items ri ON ri.card_variant_id = cv.id
       WHERE c.archived_at IS NULL
       ORDER BY c.front ASC, cv.variant_type ASC`,
    );

    const cardsById = new Map<string, DevCardReviewState>();

    for (const row of rows) {
      const existing = cardsById.get(row.cardId);

      const variant: DevCardVariantReviewState = {
        cardVariantId: row.cardVariantId,
        variantType: row.variantType,
        reviewItemId: row.reviewItemId,
        repetitions: row.repetitions,
        lapses: row.lapses,
        easeFactor: row.easeFactor,
        nextReviewAt: row.nextReviewAt,
        lastReviewedAt: row.lastReviewedAt ?? undefined,
        logCount: row.logCount,
      };

      if (existing) {
        existing.variants.push(variant);
        continue;
      }

      cardsById.set(row.cardId, {
        cardId: row.cardId,
        front: row.front,
        back: row.back,
        variants: [variant],
      });
    }

    return [...cardsById.values()];
  }

  async resetReviewStateForCardIds(cardIds: string[], now: Date): Promise<number> {
    if (cardIds.length === 0) {
      return 0;
    }

    const db = await this.getDatabase();
    const timestamp = now.toISOString();
    const { clause, params } = buildInClause(cardIds, 'cardId');

    let affectedVariants = 0;

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `DELETE FROM review_logs
         WHERE review_item_id IN (
           SELECT ri.id
           FROM review_items ri
           INNER JOIN card_variants cv ON cv.id = ri.card_variant_id
           WHERE cv.card_id IN (${clause})
         )`,
        params,
      );

      const result = await db.runAsync(
        `UPDATE review_items
         SET repetitions = $repetitions,
             interval_days = $intervalDays,
             ease_factor = $easeFactor,
             next_review_at = $nextReviewAt,
             last_reviewed_at = NULL,
             lapses = $lapses,
             updated_at = $updatedAt
         WHERE card_variant_id IN (
           SELECT id FROM card_variants WHERE card_id IN (${clause})
         )`,
        {
          ...params,
          $repetitions: INITIAL_REVIEW_ITEM_STATE.repetitions,
          $intervalDays: INITIAL_REVIEW_ITEM_STATE.intervalDays,
          $easeFactor: INITIAL_REVIEW_ITEM_STATE.easeFactor,
          $lapses: INITIAL_REVIEW_ITEM_STATE.lapses,
          $nextReviewAt: timestamp,
          $updatedAt: timestamp,
        },
      );

      affectedVariants = (result as { changes?: number }).changes ?? 0;
    });

    return affectedVariants;
  }

  async resetAllReviewState(now: Date): Promise<number> {
    const db = await this.getDatabase();
    const timestamp = now.toISOString();
    let affectedVariants = 0;

    await db.withTransactionAsync(async () => {
      await db.runAsync(`DELETE FROM review_logs`);

      const result = await db.runAsync(
        `UPDATE review_items
         SET repetitions = $repetitions,
             interval_days = $intervalDays,
             ease_factor = $easeFactor,
             next_review_at = $nextReviewAt,
             last_reviewed_at = NULL,
             lapses = $lapses,
             updated_at = $updatedAt
         WHERE card_variant_id IN (
           SELECT cv.id
           FROM card_variants cv
           INNER JOIN cards c ON c.id = cv.card_id
           WHERE c.archived_at IS NULL
         )`,
        {
          $repetitions: INITIAL_REVIEW_ITEM_STATE.repetitions,
          $intervalDays: INITIAL_REVIEW_ITEM_STATE.intervalDays,
          $easeFactor: INITIAL_REVIEW_ITEM_STATE.easeFactor,
          $lapses: INITIAL_REVIEW_ITEM_STATE.lapses,
          $nextReviewAt: timestamp,
          $updatedAt: timestamp,
        },
      );

      affectedVariants = (result as { changes?: number }).changes ?? 0;
    });

    return affectedVariants;
  }

  async makeAllCardsDueNow(now: Date): Promise<number> {
    const db = await this.getDatabase();
    const timestamp = now.toISOString();

    const result = await db.runAsync(
      `UPDATE review_items
       SET next_review_at = $nextReviewAt,
           updated_at = $updatedAt
       WHERE card_variant_id IN (
         SELECT cv.id
         FROM card_variants cv
         INNER JOIN cards c ON c.id = cv.card_id
         WHERE c.archived_at IS NULL
       )`,
      {
        $nextReviewAt: timestamp,
        $updatedAt: timestamp,
      },
    );

    return (result as { changes?: number }).changes ?? 0;
  }

  async clearAllReviewLogs(): Promise<number> {
    const db = await this.getDatabase();
    const result = await db.runAsync(`DELETE FROM review_logs`);
    return (result as { changes?: number }).changes ?? 0;
  }

  private async assertKnownTable(tableName: string): Promise<string> {
    if (!TABLE_NAME_PATTERN.test(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`);
    }

    if (!this.knownTables.has(tableName)) {
      await this.listTables();
    }

    if (!this.knownTables.has(tableName)) {
      throw new Error(`Unknown table: ${tableName}`);
    }

    return tableName;
  }
}
