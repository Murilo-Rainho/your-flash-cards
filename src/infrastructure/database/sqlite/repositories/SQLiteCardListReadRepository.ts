import { MEDIA_TYPES } from '@/domain/entities/Media';
import type {
  CardListPage,
  CardListPageParams,
  CardListReadRepository,
} from '@/domain/repositories/CardListReadRepository';
import { normalizeSearchText } from '@/utils/search';

import type { SqliteDatabaseConnection } from '../types';
import { mapCardRow, type CardRow } from './cardRowMapper';

type GetDatabase = () => Promise<SqliteDatabaseConnection>;

type CardListRow = CardRow & {
  hasAudio: number;
  hasImage: number;
};

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

export class SQLiteCardListReadRepository implements CardListReadRepository {
  constructor(private readonly getDatabase: GetDatabase) {}

  async listPage(params: CardListPageParams): Promise<CardListPage> {
    const db = await this.getDatabase();
    const limit = Math.max(1, Math.floor(params.limit));
    const normalizedQuery = normalizeSearchText(params.query);
    const rows = await db.getAllAsync<CardListRow>(
      `
WITH card_list AS (
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
    EXISTS (
      SELECT 1
      FROM media audio_media
      WHERE audio_media.card_id = card.id
        AND audio_media.type IN ($audioType, $recordingType, $ttsType)
    ) AS hasAudio,
    EXISTS (
      SELECT 1
      FROM media image_media
      WHERE image_media.card_id = card.id
        AND image_media.type = $imageType
    ) AS hasImage
  FROM cards card
  WHERE card.deck_id = $deckId
    AND card.archived_at IS NULL
    AND (
      $searchPattern IS NULL
      OR card.front_search LIKE $searchPattern ESCAPE '\\'
      OR card.back_search LIKE $searchPattern ESCAPE '\\'
    )
    AND (
      $cursorUpdatedAt IS NULL
      OR card.updated_at < $cursorUpdatedAt
      OR (card.updated_at = $cursorUpdatedAt AND card.created_at < $cursorCreatedAt)
      OR (
        card.updated_at = $cursorUpdatedAt
        AND card.created_at = $cursorCreatedAt
        AND card.id < $cursorId
      )
    )
)
SELECT *
FROM card_list
WHERE (
  ($filterAudio = 0 AND $filterImage = 0)
  OR ($filterAudio = 1 AND hasAudio = 1)
  OR ($filterImage = 1 AND hasImage = 1)
)
ORDER BY updatedAt DESC, createdAt DESC, id DESC
LIMIT $limit
`,
      {
        $deckId: params.deckId,
        $audioType: MEDIA_TYPES.AUDIO,
        $recordingType: MEDIA_TYPES.RECORDING,
        $ttsType: MEDIA_TYPES.TTS,
        $imageType: MEDIA_TYPES.IMAGE,
        $searchPattern: normalizedQuery ? `%${escapeLikePattern(normalizedQuery)}%` : null,
        $filterAudio: params.mediaFilters.audio ? 1 : 0,
        $filterImage: params.mediaFilters.image ? 1 : 0,
        $cursorUpdatedAt: params.cursor?.updatedAt ?? null,
        $cursorCreatedAt: params.cursor?.createdAt ?? null,
        $cursorId: params.cursor?.id ?? null,
        $limit: limit + 1,
      },
    );

    const pageRows = rows.slice(0, limit);
    const items = pageRows.map((row) => ({
      card: mapCardRow(row),
      hasAudio: row.hasAudio === 1,
      hasImage: row.hasImage === 1,
    }));
    const lastRow = pageRows[pageRows.length - 1];

    return {
      items,
      ...(rows.length > limit && lastRow
        ? {
            nextCursor: {
              updatedAt: lastRow.updatedAt,
              createdAt: lastRow.createdAt,
              id: lastRow.id,
            },
          }
        : {}),
    };
  }
}
