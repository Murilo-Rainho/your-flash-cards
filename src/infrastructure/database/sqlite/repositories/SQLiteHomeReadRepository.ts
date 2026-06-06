import type { Collection } from '@/domain/entities/Collection';
import type { CollectionSummary } from '@/domain/entities/CollectionSummary';
import type { DailyStudySummary } from '@/domain/entities/DailyStudySummary';
import type { HomeReadRepository } from '@/domain/repositories/HomeReadRepository';
import { countConsecutiveReviewDays, startOfLocalDay } from '@/utils/date';

import type { SqliteDatabaseConnection } from '../types';

type GetDatabase = () => Promise<SqliteDatabaseConnection>;

type CountRow = {
  value: number | null;
};

type TodayStatsRow = {
  reviewedToday: number | null;
  retentionPercentage: number | null;
};

type ReviewDateRow = {
  reviewedAt: string;
};

type CollectionSummaryRow = {
  id: string;
  name: string;
  baseLanguage: string;
  targetLanguage: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  totalDecks: number | null;
  totalCards: number | null;
  dueCards: number | null;
  masteredPercentage: number | null;
};

const ACTIVE_REVIEW_ITEM_JOIN_SQL = `
FROM review_items ri
INNER JOIN card_variants cv ON cv.id = ri.card_variant_id
INNER JOIN cards card ON card.id = cv.card_id AND card.archived_at IS NULL
INNER JOIN decks deck ON deck.id = card.deck_id AND deck.archived_at IS NULL
INNER JOIN collections collection ON collection.id = deck.collection_id AND collection.archived_at IS NULL
`;

function toNumber(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function toPercentage(value: number | null | undefined): number {
  return Math.max(0, Math.min(100, Math.round(toNumber(value))));
}

function mapCollection(row: CollectionSummaryRow): Collection {
  return {
    id: row.id,
    name: row.name,
    baseLanguage: row.baseLanguage,
    targetLanguage: row.targetLanguage,
    description: row.description ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    archivedAt: row.archivedAt ?? undefined,
  };
}

function mapCollectionSummary(row: CollectionSummaryRow): CollectionSummary {
  return {
    collection: mapCollection(row),
    totalDecks: toNumber(row.totalDecks),
    totalCards: toNumber(row.totalCards),
    dueCards: toNumber(row.dueCards),
    masteredPercentage: toPercentage(row.masteredPercentage),
  };
}

export class SQLiteHomeReadRepository implements HomeReadRepository {
  constructor(private readonly getDatabase: GetDatabase) {}

  async getDailyStudySummary(now: Date): Promise<DailyStudySummary> {
    const [dueCards, difficultCards, todayStats, masteredCards, reviewDates] = await Promise.all([
      this.countDueCards(now),
      this.countDifficultCards(),
      this.getTodayStats(now),
      this.countMasteredCards(),
      this.listRecentReviewDates(),
    ]);

    return {
      dueCards,
      difficultCards,
      reviewedToday: todayStats.reviewedToday,
      retentionPercentage: todayStats.retentionPercentage,
      streakDays: countConsecutiveReviewDays(
        reviewDates.map((row) => row.reviewedAt),
        now,
      ),
      masteredCards,
    };
  }

  async listCollectionSummaries(now: Date): Promise<CollectionSummary[]> {
    const db = await this.getDatabase();
    const rows = await db.getAllAsync<CollectionSummaryRow>(
      `
SELECT
  collection.id,
  collection.name,
  collection.base_language AS baseLanguage,
  collection.target_language AS targetLanguage,
  collection.description,
  collection.created_at AS createdAt,
  collection.updated_at AS updatedAt,
  collection.archived_at AS archivedAt,
  COUNT(DISTINCT deck.id) AS totalDecks,
  COUNT(DISTINCT card.id) AS totalCards,
  COUNT(DISTINCT CASE WHEN ri.next_review_at <= $now THEN ri.id END) AS dueCards,
  CASE
    WHEN COUNT(DISTINCT ri.id) = 0 THEN 0
    ELSE ROUND(
      100.0 * COUNT(DISTINCT CASE WHEN ri.repetitions >= 5 AND ri.lapses = 0 THEN ri.id END)
      / COUNT(DISTINCT ri.id)
    )
  END AS masteredPercentage
FROM collections collection
LEFT JOIN decks deck
  ON deck.collection_id = collection.id
  AND deck.archived_at IS NULL
LEFT JOIN cards card
  ON card.deck_id = deck.id
  AND card.archived_at IS NULL
LEFT JOIN card_variants cv
  ON cv.card_id = card.id
LEFT JOIN review_items ri
  ON ri.card_variant_id = cv.id
WHERE collection.archived_at IS NULL
GROUP BY
  collection.id,
  collection.name,
  collection.base_language,
  collection.target_language,
  collection.description,
  collection.created_at,
  collection.updated_at,
  collection.archived_at
ORDER BY collection.updated_at DESC, collection.created_at DESC
`,
      { $now: now.toISOString() },
    );

    return rows.map(mapCollectionSummary);
  }

  private async countDueCards(now: Date): Promise<number> {
    const db = await this.getDatabase();
    const row = await db.getFirstAsync<CountRow>(
      `
SELECT COUNT(DISTINCT ri.id) AS value
${ACTIVE_REVIEW_ITEM_JOIN_SQL}
WHERE ri.next_review_at <= $now
`,
      { $now: now.toISOString() },
    );

    return toNumber(row?.value);
  }

  private async countDifficultCards(): Promise<number> {
    const db = await this.getDatabase();
    const row = await db.getFirstAsync<CountRow>(
      `
SELECT COUNT(DISTINCT rl.review_item_id) AS value
FROM review_logs rl
INNER JOIN review_items ri ON ri.id = rl.review_item_id
INNER JOIN card_variants cv ON cv.id = ri.card_variant_id
INNER JOIN cards card ON card.id = cv.card_id AND card.archived_at IS NULL
INNER JOIN decks deck ON deck.id = card.deck_id AND deck.archived_at IS NULL
INNER JOIN collections collection ON collection.id = deck.collection_id AND collection.archived_at IS NULL
WHERE rl.rating IN ('again', 'hard')
  AND rl.reviewed_at = (
    SELECT MAX(latest.reviewed_at)
    FROM review_logs latest
    WHERE latest.review_item_id = rl.review_item_id
  )
`,
    );

    return toNumber(row?.value);
  }

  private async getTodayStats(
    now: Date,
  ): Promise<Pick<DailyStudySummary, 'reviewedToday' | 'retentionPercentage'>> {
    const db = await this.getDatabase();
    const startOfDay = startOfLocalDay(now).toISOString();
    const row = await db.getFirstAsync<TodayStatsRow>(
      `
SELECT
  COUNT(DISTINCT rl.review_item_id) AS reviewedToday,
  CASE
    WHEN COUNT(rl.id) = 0 THEN 0
    ELSE ROUND(100.0 * SUM(CASE WHEN rl.rating != 'again' THEN 1 ELSE 0 END) / COUNT(rl.id))
  END AS retentionPercentage
FROM review_logs rl
INNER JOIN review_items ri ON ri.id = rl.review_item_id
INNER JOIN card_variants cv ON cv.id = ri.card_variant_id
INNER JOIN cards card ON card.id = cv.card_id AND card.archived_at IS NULL
INNER JOIN decks deck ON deck.id = card.deck_id AND deck.archived_at IS NULL
INNER JOIN collections collection ON collection.id = deck.collection_id AND collection.archived_at IS NULL
WHERE rl.reviewed_at >= $startOfDay
  AND rl.reviewed_at <= $now
`,
      { $startOfDay: startOfDay, $now: now.toISOString() },
    );

    return {
      reviewedToday: toNumber(row?.reviewedToday),
      retentionPercentage: toPercentage(row?.retentionPercentage),
    };
  }

  private async countMasteredCards(): Promise<number> {
    const db = await this.getDatabase();
    const row = await db.getFirstAsync<CountRow>(
      `
SELECT COUNT(DISTINCT ri.id) AS value
${ACTIVE_REVIEW_ITEM_JOIN_SQL}
WHERE ri.repetitions >= 5
  AND ri.lapses = 0
`,
    );

    return toNumber(row?.value);
  }

  private async listRecentReviewDates(): Promise<ReviewDateRow[]> {
    const db = await this.getDatabase();

    return db.getAllAsync<ReviewDateRow>(
      `
SELECT reviewed_at AS reviewedAt
FROM review_logs
ORDER BY reviewed_at DESC
LIMIT 366
`,
    );
  }
}
