import type { Media, MediaSide, MediaType } from '@/domain/entities/Media';
import type { Tag } from '@/domain/entities/Tag';
import type {
  CardExportReadRepository,
  ExportCardRecord,
} from '@/domain/repositories/CardExportReadRepository';

import type { SqliteDatabaseConnection } from '../types';
import { mapCardRow, type CardRow } from './cardRowMapper';

type GetDatabase = () => Promise<SqliteDatabaseConnection>;

type ExportCardRow = CardRow & { deckName: string };

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

type ExportTagRow = {
  cardId: string;
  id: string;
  collectionId: string;
  name: string;
  normalizedName: string;
  createdAt: string;
  updatedAt: string;
};

function mapMediaRow(row: MediaRow): Media {
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

function mapTagRow(row: ExportTagRow): Tag {
  return {
    id: row.id,
    collectionId: row.collectionId,
    name: row.name,
    normalizedName: row.normalizedName,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function groupByCard<T extends { cardId: string }, R>(
  rows: readonly T[],
  map: (row: T) => R,
): Map<string, R[]> {
  const grouped = new Map<string, R[]>();

  for (const row of rows) {
    const list = grouped.get(row.cardId);

    if (list) {
      list.push(map(row));
    } else {
      grouped.set(row.cardId, [map(row)]);
    }
  }

  return grouped;
}

/** Reads all active cards of a collection (across decks) with deck name, tags and media (§24). */
export class SQLiteCardExportReadRepository implements CardExportReadRepository {
  constructor(private readonly getDatabase: GetDatabase) {}

  async listCardsByCollection(collectionId: string): Promise<ExportCardRecord[]> {
    const db = await this.getDatabase();

    const cardRows = await db.getAllAsync<ExportCardRow>(
      `
SELECT
  card.id,
  card.deck_id AS deckId,
  card.type,
  card.front,
  card.back,
  card.cloze_data AS clozeData,
  card.notes,
  card.created_at AS createdAt,
  card.updated_at AS updatedAt,
  card.archived_at AS archivedAt,
  deck.name AS deckName
FROM cards card
INNER JOIN decks deck ON deck.id = card.deck_id
WHERE deck.collection_id = $collectionId
  AND card.archived_at IS NULL
  AND deck.archived_at IS NULL
ORDER BY deck.name ASC, card.created_at ASC, card.id ASC
`,
      { $collectionId: collectionId },
    );

    if (cardRows.length === 0) {
      return [];
    }

    const [mediaRows, tagRows] = await Promise.all([
      db.getAllAsync<MediaRow>(
        `
SELECT
  media.id,
  media.card_id AS cardId,
  media.card_variant_id AS cardVariantId,
  media.side,
  media.type,
  media.uri,
  media.mime_type AS mimeType,
  media.created_at AS createdAt,
  media.updated_at AS updatedAt
FROM media
INNER JOIN cards card ON card.id = media.card_id
INNER JOIN decks deck ON deck.id = card.deck_id
WHERE deck.collection_id = $collectionId
  AND card.archived_at IS NULL
  AND deck.archived_at IS NULL
`,
        { $collectionId: collectionId },
      ),
      db.getAllAsync<ExportTagRow>(
        `
SELECT
  link.card_id AS cardId,
  tag.id AS id,
  tag.collection_id AS collectionId,
  tag.name AS name,
  tag.normalized_name AS normalizedName,
  tag.created_at AS createdAt,
  tag.updated_at AS updatedAt
FROM card_tags link
INNER JOIN tags tag ON tag.id = link.tag_id
INNER JOIN cards card ON card.id = link.card_id
INNER JOIN decks deck ON deck.id = card.deck_id
WHERE deck.collection_id = $collectionId
  AND card.archived_at IS NULL
  AND deck.archived_at IS NULL
ORDER BY tag.normalized_name ASC
`,
        { $collectionId: collectionId },
      ),
    ]);

    const mediaByCard = groupByCard(mediaRows, mapMediaRow);
    const tagsByCard = groupByCard(tagRows, mapTagRow);

    return cardRows.map((row) => ({
      deckName: row.deckName,
      card: mapCardRow(row),
      tags: tagsByCard.get(row.id) ?? [],
      media: mediaByCard.get(row.id) ?? [],
    }));
  }
}
