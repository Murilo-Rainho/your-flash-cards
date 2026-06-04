import type { CardAggregate, CardRepository } from '@/domain/repositories/CardRepository';

import type { SqliteDatabaseConnection } from '../types';

type GetDatabase = () => Promise<SqliteDatabaseConnection>;

type TagIdRow = {
  id: string;
};

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
  name,
  normalized_name,
  created_at,
  updated_at
) VALUES (
  $id,
  $name,
  $normalizedName,
  $createdAt,
  $updatedAt
)`,
          {
            $id: tag.id,
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
WHERE normalized_name = $normalizedName
`,
          {
            $name: tag.name,
            $normalizedName: tag.normalizedName,
            $updatedAt: tag.updatedAt,
          },
        );

        const storedTag = await db.getFirstAsync<TagIdRow>(
          `
SELECT id
FROM tags
WHERE normalized_name = $normalizedName
LIMIT 1
`,
          { $normalizedName: tag.normalizedName },
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
}
