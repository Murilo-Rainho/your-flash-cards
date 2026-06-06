import type { CardType } from '@/constants/cardTypes';
import type { ReviewRating } from '@/constants/reviewRatings';
import type { VariantType } from '@/domain/entities/CardVariant';
import type { Media, MediaSide, MediaType } from '@/domain/entities/Media';
import type { ReviewItem } from '@/domain/entities/ReviewItem';
import type { ReviewLog } from '@/domain/entities/ReviewLog';
import type {
  ApplyReviewInput,
  DailyReviewedCard,
  DueReviewCard,
  ListDueReviewCardsParams,
  ReviewRepository,
} from '@/domain/repositories/ReviewRepository';
import { startOfLocalDay } from '@/utils/date';
import { createLocalId } from '@/utils/ids';

import type { SqliteDatabaseConnection } from '../types';

type GetDatabase = () => Promise<SqliteDatabaseConnection>;

type DueReviewRow = {
  reviewItemId: string;
  cardVariantId: string;
  schedulerType: string;
  schedulerVersion: string;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  lapses: number;
  createdAt: string;
  updatedAt: string;
  variantType: VariantType;
  cardId: string;
  cardType: CardType;
  front: string;
  back: string;
  notes: string | null;
};

type DailyReviewedRow = {
  cardId: string;
  cardType: CardType;
  front: string;
  back: string;
  finalRating: ReviewRating;
  attempts: number;
  reviewedAt: string;
};

type MediaRow = {
  id: string;
  cardId: string;
  cardVariantId: string | null;
  side: MediaSide;
  type: MediaType;
  uri: string;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
};

const DUE_REVIEW_SELECT_SQL = `
SELECT
  ri.id AS reviewItemId,
  ri.card_variant_id AS cardVariantId,
  ri.scheduler_type AS schedulerType,
  ri.scheduler_version AS schedulerVersion,
  ri.repetitions,
  ri.interval_days AS intervalDays,
  ri.ease_factor AS easeFactor,
  ri.next_review_at AS nextReviewAt,
  ri.last_reviewed_at AS lastReviewedAt,
  ri.lapses,
  ri.created_at AS createdAt,
  ri.updated_at AS updatedAt,
  cv.variant_type AS variantType,
  card.id AS cardId,
  card.type AS cardType,
  card.front,
  card.back,
  card.notes
FROM review_items ri
INNER JOIN card_variants cv ON cv.id = ri.card_variant_id
INNER JOIN cards card ON card.id = cv.card_id AND card.archived_at IS NULL
INNER JOIN decks deck ON deck.id = card.deck_id AND deck.archived_at IS NULL
INNER JOIN collections collection ON collection.id = deck.collection_id AND collection.archived_at IS NULL
`;

function mapReviewItem(row: DueReviewRow): ReviewItem {
  return {
    id: row.reviewItemId,
    cardVariantId: row.cardVariantId,
    schedulerType: row.schedulerType,
    schedulerVersion: row.schedulerVersion,
    repetitions: row.repetitions,
    intervalDays: row.intervalDays,
    easeFactor: row.easeFactor,
    nextReviewAt: row.nextReviewAt,
    lastReviewedAt: row.lastReviewedAt ?? undefined,
    lapses: row.lapses,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapMedia(row: MediaRow): Media {
  return {
    id: row.id,
    cardId: row.cardId,
    cardVariantId: row.cardVariantId ?? undefined,
    side: row.side,
    type: row.type,
    uri: row.uri,
    mimeType: row.mimeType,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class SQLiteReviewRepository implements ReviewRepository {
  constructor(private readonly getDatabase: GetDatabase) {}

  async listDueReviewCards(params: ListDueReviewCardsParams): Promise<DueReviewCard[]> {
    const db = await this.getDatabase();

    const queryParams: Record<string, string | number> = {
      $now: params.now.toISOString(),
      $limit: params.limit,
    };

    let whereClause = 'WHERE ri.next_review_at <= $now';
    if (params.collectionId) {
      whereClause += '\n  AND collection.id = $collectionId';
      queryParams.$collectionId = params.collectionId;
    }
    if (params.deckId) {
      whereClause += '\n  AND deck.id = $deckId';
      queryParams.$deckId = params.deckId;
    }

    const rows = await db.getAllAsync<DueReviewRow>(
      `${DUE_REVIEW_SELECT_SQL}${whereClause}
ORDER BY ri.next_review_at ASC
LIMIT $limit
`,
      queryParams,
    );

    if (rows.length === 0) {
      return [];
    }

    const mediaByCard = await this.loadMediaByCard(
      db,
      rows.map((row) => row.cardId),
    );

    return rows.map((row) => ({
      reviewItem: mapReviewItem(row),
      cardId: row.cardId,
      cardType: row.cardType,
      front: row.front,
      back: row.back,
      notes: row.notes ?? undefined,
      variantType: row.variantType,
      media: mediaByCard.get(row.cardId) ?? [],
    }));
  }

  async listReviewsForDay(now: Date): Promise<DailyReviewedCard[]> {
    const db = await this.getDatabase();
    const startOfDay = startOfLocalDay(now).toISOString();

    const rows = await db.getAllAsync<DailyReviewedRow>(
      `
SELECT
  card.id AS cardId,
  card.type AS cardType,
  card.front AS front,
  card.back AS back,
  COUNT(rl.id) AS attempts,
  MAX(rl.reviewed_at) AS reviewedAt,
  (
    SELECT latest.rating
    FROM review_logs latest
    INNER JOIN review_items latest_ri ON latest_ri.id = latest.review_item_id
    INNER JOIN card_variants latest_cv ON latest_cv.id = latest_ri.card_variant_id
    WHERE latest_cv.card_id = card.id
      AND latest.reviewed_at >= $startOfDay
      AND latest.reviewed_at <= $now
    ORDER BY latest.reviewed_at DESC
    LIMIT 1
  ) AS finalRating
FROM review_logs rl
INNER JOIN review_items ri ON ri.id = rl.review_item_id
INNER JOIN card_variants cv ON cv.id = ri.card_variant_id
INNER JOIN cards card ON card.id = cv.card_id AND card.archived_at IS NULL
INNER JOIN decks deck ON deck.id = card.deck_id AND deck.archived_at IS NULL
INNER JOIN collections collection ON collection.id = deck.collection_id AND collection.archived_at IS NULL
WHERE rl.reviewed_at >= $startOfDay
  AND rl.reviewed_at <= $now
GROUP BY card.id, card.type, card.front, card.back
ORDER BY reviewedAt DESC
`,
      { $startOfDay: startOfDay, $now: now.toISOString() },
    );

    return rows.map((row) => ({
      cardId: row.cardId,
      cardType: row.cardType,
      front: row.front,
      back: row.back,
      finalRating: row.finalRating,
      attempts: row.attempts,
      reviewedAt: row.reviewedAt,
    }));
  }

  private async loadMediaByCard(
    db: SqliteDatabaseConnection,
    cardIds: string[],
  ): Promise<Map<string, Media[]>> {
    const uniqueIds = [...new Set(cardIds)];
    const placeholders = uniqueIds.map((_, index) => `$c${index}`);
    const mediaParams: Record<string, string> = {};
    uniqueIds.forEach((id, index) => {
      mediaParams[`$c${index}`] = id;
    });

    const mediaRows = await db.getAllAsync<MediaRow>(
      `
SELECT
  id,
  card_id AS cardId,
  card_variant_id AS cardVariantId,
  side,
  type,
  uri,
  mime_type AS mimeType,
  created_at AS createdAt,
  updated_at AS updatedAt
FROM media
WHERE card_id IN (${placeholders.join(', ')})
`,
      mediaParams,
    );

    const grouped = new Map<string, Media[]>();
    for (const row of mediaRows) {
      const list = grouped.get(row.cardId) ?? [];
      list.push(mapMedia(row));
      grouped.set(row.cardId, list);
    }

    return grouped;
  }

  async applyReview(input: ApplyReviewInput): Promise<ReviewLog> {
    const db = await this.getDatabase();
    const reviewedAtIso = input.reviewedAt.toISOString();
    const logId = createLocalId('review-log');

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `
UPDATE review_items
SET repetitions = $repetitions,
    interval_days = $intervalDays,
    ease_factor = $easeFactor,
    lapses = $lapses,
    next_review_at = $nextReviewAt,
    last_reviewed_at = $reviewedAt,
    updated_at = $reviewedAt
WHERE id = $reviewItemId
`,
        {
          $repetitions: input.result.repetitions,
          $intervalDays: input.result.intervalDays,
          $easeFactor: input.result.easeFactor,
          $lapses: input.result.lapses,
          $nextReviewAt: input.result.nextReviewAt,
          $reviewedAt: reviewedAtIso,
          $reviewItemId: input.reviewItemId,
        },
      );

      await db.runAsync(
        `
INSERT INTO review_logs (
  id,
  review_item_id,
  session_id,
  rating,
  reviewed_at,
  time_spent_ms,
  previous_interval_days,
  next_interval_days,
  previous_ease_factor,
  next_ease_factor
) VALUES (
  $id,
  $reviewItemId,
  $sessionId,
  $rating,
  $reviewedAt,
  $timeSpentMs,
  $previousIntervalDays,
  $nextIntervalDays,
  $previousEaseFactor,
  $nextEaseFactor
)`,
        {
          $id: logId,
          $reviewItemId: input.reviewItemId,
          $sessionId: input.sessionId ?? null,
          $rating: input.rating,
          $reviewedAt: reviewedAtIso,
          $timeSpentMs: input.timeSpentMs,
          $previousIntervalDays: input.previousIntervalDays,
          $nextIntervalDays: input.result.intervalDays,
          $previousEaseFactor: input.previousEaseFactor,
          $nextEaseFactor: input.result.easeFactor,
        },
      );
    });

    return {
      id: logId,
      reviewItemId: input.reviewItemId,
      sessionId: input.sessionId,
      rating: input.rating,
      reviewedAt: reviewedAtIso,
      timeSpentMs: input.timeSpentMs,
      previousIntervalDays: input.previousIntervalDays,
      nextIntervalDays: input.result.intervalDays,
      previousEaseFactor: input.previousEaseFactor,
      nextEaseFactor: input.result.easeFactor,
    };
  }
}
