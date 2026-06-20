import { serializeClozeContent } from '@/domain/cloze/clozeContent';
import type { CardVariant, VariantType } from '@/domain/entities/CardVariant';
import type { Media, MediaSide, MediaType } from '@/domain/entities/Media';
import type { ReviewItem } from '@/domain/entities/ReviewItem';
import type { Tag } from '@/domain/entities/Tag';
import type { CardAggregate, CardRepository } from '@/domain/repositories/CardRepository';
import { normalizeSearchText } from '@/utils/search';

import type { SqliteDatabaseConnection } from '../types';
import { mapCardRow, type CardRow } from './cardRowMapper';

type GetDatabase = () => Promise<SqliteDatabaseConnection>;

type TagIdRow = {
  id: string;
};

type CardVariantRow = {
  id: string;
  cardId: string;
  variantType: VariantType;
  isGenerated: number;
  createdAt: string;
  updatedAt: string;
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

type TagRow = {
  id: string;
  collectionId: string;
  name: string;
  normalizedName: string;
  createdAt: string;
  updatedAt: string;
};

type ReviewItemRow = {
  id: string;
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
};

function mapCardVariant(row: CardVariantRow): CardVariant {
  return {
    id: row.id,
    cardId: row.cardId,
    variantType: row.variantType,
    isGenerated: row.isGenerated === 1,
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

function mapTag(row: TagRow): Tag {
  return {
    id: row.id,
    collectionId: row.collectionId,
    name: row.name,
    normalizedName: row.normalizedName,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapReviewItem(row: ReviewItemRow): ReviewItem {
  return {
    id: row.id,
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

export class SQLiteCardRepository implements CardRepository {
  constructor(private readonly getDatabase: GetDatabase) {}

  async createAggregate(aggregate: CardAggregate): Promise<CardAggregate> {
    const db = await this.getDatabase();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `
INSERT INTO cards (
  id,
  deck_id,
  type,
  front,
  back,
  front_search,
  back_search,
  cloze_data,
  notes,
  created_at,
  updated_at,
  archived_at
) VALUES (
  $id,
  $deckId,
  $type,
  $front,
  $back,
  $frontSearch,
  $backSearch,
  $clozeData,
  $notes,
  $createdAt,
  $updatedAt,
  $archivedAt
)`,
        {
          $id: aggregate.card.id,
          $deckId: aggregate.card.deckId,
          $type: aggregate.card.type,
          $front: aggregate.card.front,
          $back: aggregate.card.back,
          $frontSearch: normalizeSearchText(aggregate.card.front),
          $backSearch: normalizeSearchText(aggregate.card.back),
          $clozeData: aggregate.card.cloze ? serializeClozeContent(aggregate.card.cloze) : null,
          $notes: aggregate.card.notes ?? null,
          $createdAt: aggregate.card.createdAt,
          $updatedAt: aggregate.card.updatedAt,
          $archivedAt: aggregate.card.archivedAt ?? null,
        },
      );

      for (const variant of aggregate.variants) {
        await db.runAsync(
          `
INSERT INTO card_variants (
  id,
  card_id,
  variant_type,
  is_generated,
  created_at,
  updated_at
) VALUES (
  $id,
  $cardId,
  $variantType,
  $isGenerated,
  $createdAt,
  $updatedAt
)`,
          {
            $id: variant.id,
            $cardId: variant.cardId,
            $variantType: variant.variantType,
            $isGenerated: variant.isGenerated ? 1 : 0,
            $createdAt: variant.createdAt,
            $updatedAt: variant.updatedAt,
          },
        );
      }

      for (const media of aggregate.media) {
        await db.runAsync(
          `
INSERT INTO media (
  id,
  card_id,
  card_variant_id,
  side,
  type,
  uri,
  mime_type,
  created_at,
  updated_at
) VALUES (
  $id,
  $cardId,
  $cardVariantId,
  $side,
  $type,
  $uri,
  $mimeType,
  $createdAt,
  $updatedAt
)`,
          {
            $id: media.id,
            $cardId: media.cardId,
            $cardVariantId: media.cardVariantId ?? null,
            $side: media.side,
            $type: media.type,
            $uri: media.uri,
            $mimeType: media.mimeType,
            $createdAt: media.createdAt,
            $updatedAt: media.updatedAt,
          },
        );
      }

      for (const tag of aggregate.tags) {
        await db.runAsync(
          `
INSERT OR IGNORE INTO tags (
  id,
  collection_id,
  name,
  normalized_name,
  created_at,
  updated_at
) VALUES (
  $id,
  $collectionId,
  $name,
  $normalizedName,
  $createdAt,
  $updatedAt
)`,
          {
            $id: tag.id,
            $collectionId: tag.collectionId,
            $name: tag.name,
            $normalizedName: tag.normalizedName,
            $createdAt: tag.createdAt,
            $updatedAt: tag.updatedAt,
          },
        );

        await db.runAsync(
          `
UPDATE tags
SET name = $name,
    updated_at = $updatedAt
WHERE collection_id = $collectionId
  AND normalized_name = $normalizedName
`,
          {
            $name: tag.name,
            $collectionId: tag.collectionId,
            $normalizedName: tag.normalizedName,
            $updatedAt: tag.updatedAt,
          },
        );

        const storedTag = await db.getFirstAsync<TagIdRow>(
          `
SELECT id
FROM tags
WHERE collection_id = $collectionId
  AND normalized_name = $normalizedName
LIMIT 1
`,
          {
            $collectionId: tag.collectionId,
            $normalizedName: tag.normalizedName,
          },
        );

        if (storedTag) {
          await db.runAsync(
            `
INSERT OR IGNORE INTO card_tags (
  card_id,
  tag_id
) VALUES (
  $cardId,
  $tagId
)`,
            {
              $cardId: aggregate.card.id,
              $tagId: storedTag.id,
            },
          );
        }
      }

      for (const reviewItem of aggregate.reviewItems) {
        await db.runAsync(
          `
INSERT INTO review_items (
  id,
  card_variant_id,
  scheduler_type,
  scheduler_version,
  repetitions,
  interval_days,
  ease_factor,
  next_review_at,
  last_reviewed_at,
  lapses,
  created_at,
  updated_at
) VALUES (
  $id,
  $cardVariantId,
  $schedulerType,
  $schedulerVersion,
  $repetitions,
  $intervalDays,
  $easeFactor,
  $nextReviewAt,
  $lastReviewedAt,
  $lapses,
  $createdAt,
  $updatedAt
)`,
          {
            $id: reviewItem.id,
            $cardVariantId: reviewItem.cardVariantId,
            $schedulerType: reviewItem.schedulerType,
            $schedulerVersion: reviewItem.schedulerVersion,
            $repetitions: reviewItem.repetitions,
            $intervalDays: reviewItem.intervalDays,
            $easeFactor: reviewItem.easeFactor,
            $nextReviewAt: reviewItem.nextReviewAt,
            $lastReviewedAt: reviewItem.lastReviewedAt ?? null,
            $lapses: reviewItem.lapses,
            $createdAt: reviewItem.createdAt,
            $updatedAt: reviewItem.updatedAt,
          },
        );
      }

      await db.runAsync(
        `
UPDATE decks
SET updated_at = $updatedAt
WHERE id = $deckId
  AND archived_at IS NULL
`,
        {
          $deckId: aggregate.card.deckId,
          $updatedAt: aggregate.card.updatedAt,
        },
      );

      await db.runAsync(
        `
UPDATE collections
SET updated_at = $updatedAt
WHERE id = (
  SELECT collection_id
  FROM decks
  WHERE id = $deckId
)
  AND archived_at IS NULL
`,
        {
          $deckId: aggregate.card.deckId,
          $updatedAt: aggregate.card.updatedAt,
        },
      );
    });

    return aggregate;
  }

  async updateAggregate(aggregate: CardAggregate): Promise<CardAggregate> {
    const db = await this.getDatabase();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `
UPDATE cards
SET deck_id = $deckId,
    front = $front,
    back = $back,
    front_search = $frontSearch,
    back_search = $backSearch,
    cloze_data = $clozeData,
    notes = $notes,
    updated_at = $updatedAt
WHERE id = $id
  AND archived_at IS NULL
`,
        {
          $id: aggregate.card.id,
          $deckId: aggregate.card.deckId,
          $front: aggregate.card.front,
          $back: aggregate.card.back,
          $frontSearch: normalizeSearchText(aggregate.card.front),
          $backSearch: normalizeSearchText(aggregate.card.back),
          $clozeData: aggregate.card.cloze ? serializeClozeContent(aggregate.card.cloze) : null,
          $notes: aggregate.card.notes ?? null,
          $updatedAt: aggregate.card.updatedAt,
        },
      );

      // Media: replace the full set (the service already copied/removed files).
      await db.runAsync(`DELETE FROM media WHERE card_id = $cardId`, {
        $cardId: aggregate.card.id,
      });

      for (const media of aggregate.media) {
        await db.runAsync(
          `
INSERT INTO media (
  id,
  card_id,
  card_variant_id,
  side,
  type,
  uri,
  mime_type,
  created_at,
  updated_at
) VALUES (
  $id,
  $cardId,
  $cardVariantId,
  $side,
  $type,
  $uri,
  $mimeType,
  $createdAt,
  $updatedAt
)`,
          {
            $id: media.id,
            $cardId: media.cardId,
            $cardVariantId: media.cardVariantId ?? null,
            $side: media.side,
            $type: media.type,
            $uri: media.uri,
            $mimeType: media.mimeType,
            $createdAt: media.createdAt,
            $updatedAt: media.updatedAt,
          },
        );
      }

      // Tags: recreate card links (orphan tags remain in the catalog).
      await db.runAsync(`DELETE FROM card_tags WHERE card_id = $cardId`, {
        $cardId: aggregate.card.id,
      });

      for (const tag of aggregate.tags) {
        await db.runAsync(
          `
INSERT OR IGNORE INTO tags (
  id,
  collection_id,
  name,
  normalized_name,
  created_at,
  updated_at
) VALUES (
  $id,
  $collectionId,
  $name,
  $normalizedName,
  $createdAt,
  $updatedAt
)`,
          {
            $id: tag.id,
            $collectionId: tag.collectionId,
            $name: tag.name,
            $normalizedName: tag.normalizedName,
            $createdAt: tag.createdAt,
            $updatedAt: tag.updatedAt,
          },
        );

        await db.runAsync(
          `
UPDATE tags
SET name = $name,
    updated_at = $updatedAt
WHERE collection_id = $collectionId
  AND normalized_name = $normalizedName
`,
          {
            $name: tag.name,
            $collectionId: tag.collectionId,
            $normalizedName: tag.normalizedName,
            $updatedAt: tag.updatedAt,
          },
        );

        const storedTag = await db.getFirstAsync<TagIdRow>(
          `
SELECT id
FROM tags
WHERE collection_id = $collectionId
  AND normalized_name = $normalizedName
LIMIT 1
`,
          {
            $collectionId: tag.collectionId,
            $normalizedName: tag.normalizedName,
          },
        );

        if (storedTag) {
          await db.runAsync(
            `
INSERT OR IGNORE INTO card_tags (
  card_id,
  tag_id
) VALUES (
  $cardId,
  $tagId
)`,
            {
              $cardId: aggregate.card.id,
              $tagId: storedTag.id,
            },
          );
        }
      }

      await db.runAsync(
        `
UPDATE decks
SET updated_at = $updatedAt
WHERE id = $deckId
  AND archived_at IS NULL
`,
        {
          $deckId: aggregate.card.deckId,
          $updatedAt: aggregate.card.updatedAt,
        },
      );

      await db.runAsync(
        `
UPDATE collections
SET updated_at = $updatedAt
WHERE id = (
  SELECT collection_id
  FROM decks
  WHERE id = $deckId
)
  AND archived_at IS NULL
`,
        {
          $deckId: aggregate.card.deckId,
          $updatedAt: aggregate.card.updatedAt,
        },
      );
    });

    return aggregate;
  }

  async archiveCard(id: string, archivedAt: string): Promise<void> {
    const db = await this.getDatabase();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `
UPDATE cards
SET archived_at = $archivedAt,
    updated_at = $archivedAt
WHERE id = $id
  AND archived_at IS NULL
`,
        {
          $id: id,
          $archivedAt: archivedAt,
        },
      );

      await db.runAsync(
        `
UPDATE decks
SET updated_at = $archivedAt
WHERE id = (
  SELECT deck_id
  FROM cards
  WHERE id = $id
)
`,
        {
          $id: id,
          $archivedAt: archivedAt,
        },
      );

      await db.runAsync(
        `
UPDATE collections
SET updated_at = $archivedAt
WHERE id = (
  SELECT collection_id
  FROM decks
  WHERE id = (
    SELECT deck_id
    FROM cards
    WHERE id = $id
  )
)
`,
        {
          $id: id,
          $archivedAt: archivedAt,
        },
      );
    });
  }

  async findAggregateById(id: string): Promise<CardAggregate | null> {
    const db = await this.getDatabase();

    const cardRow = await db.getFirstAsync<CardRow>(
      `
SELECT
  id,
  deck_id AS deckId,
  type,
  front,
  back,
  cloze_data AS clozeData,
  notes,
  created_at AS createdAt,
  updated_at AS updatedAt,
  archived_at AS archivedAt
FROM cards
WHERE id = $id
  AND archived_at IS NULL
LIMIT 1
`,
      { $id: id },
    );

    if (!cardRow) {
      return null;
    }

    const [variantRows, mediaRows, tagRows] = await Promise.all([
      db.getAllAsync<CardVariantRow>(
        `
SELECT
  id,
  card_id AS cardId,
  variant_type AS variantType,
  is_generated AS isGenerated,
  created_at AS createdAt,
  updated_at AS updatedAt
FROM card_variants
WHERE card_id = $cardId
ORDER BY created_at ASC
`,
        { $cardId: id },
      ),
      db.getAllAsync<MediaRow>(
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
WHERE card_id = $cardId
ORDER BY created_at ASC
`,
        { $cardId: id },
      ),
      db.getAllAsync<TagRow>(
        `
SELECT
  tag.id AS id,
  tag.collection_id AS collectionId,
  tag.name AS name,
  tag.normalized_name AS normalizedName,
  tag.created_at AS createdAt,
  tag.updated_at AS updatedAt
FROM card_tags link
INNER JOIN tags tag ON tag.id = link.tag_id
WHERE link.card_id = $cardId
ORDER BY tag.normalized_name ASC
`,
        { $cardId: id },
      ),
    ]);

    const variantIds = variantRows.map((variant) => variant.id);
    const reviewItemRows = await this.loadReviewItems(db, variantIds);

    return {
      card: mapCardRow(cardRow),
      variants: variantRows.map(mapCardVariant),
      media: mediaRows.map(mapMedia),
      tags: tagRows.map(mapTag),
      reviewItems: reviewItemRows.map(mapReviewItem),
    };
  }

  private async loadReviewItems(
    db: SqliteDatabaseConnection,
    variantIds: string[],
  ): Promise<ReviewItemRow[]> {
    if (variantIds.length === 0) {
      return [];
    }

    const placeholders = variantIds.map((_, index) => `$id${index}`).join(', ');
    const params: Record<string, string> = {};
    variantIds.forEach((variantId, index) => {
      params[`$id${index}`] = variantId;
    });

    return db.getAllAsync<ReviewItemRow>(
      `
SELECT
  id,
  card_variant_id AS cardVariantId,
  scheduler_type AS schedulerType,
  scheduler_version AS schedulerVersion,
  repetitions,
  interval_days AS intervalDays,
  ease_factor AS easeFactor,
  next_review_at AS nextReviewAt,
  last_reviewed_at AS lastReviewedAt,
  lapses,
  created_at AS createdAt,
  updated_at AS updatedAt
FROM review_items
WHERE card_variant_id IN (${placeholders})
`,
      params,
    );
  }
}
