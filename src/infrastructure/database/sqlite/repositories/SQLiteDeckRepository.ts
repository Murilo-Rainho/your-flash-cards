import type { Deck } from '@/domain/entities/Deck';
import type { DeckRepository } from '@/domain/repositories/DeckRepository';

import type { SqliteDatabaseConnection } from '../types';

type GetDatabase = () => Promise<SqliteDatabaseConnection>;

type DeckRow = {
  id: string;
  collectionId: string;
  name: string;
  description: string | null;
  autoGenerateReverseCards: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
};

function mapDeck(row: DeckRow): Deck {
  return {
    id: row.id,
    collectionId: row.collectionId,
    name: row.name,
    description: row.description ?? undefined,
    autoGenerateReverseCards: row.autoGenerateReverseCards === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    archivedAt: row.archivedAt ?? undefined,
  };
}

export class SQLiteDeckRepository implements DeckRepository {
  constructor(private readonly getDatabase: GetDatabase) {}

  async create(deck: Deck): Promise<Deck> {
    const db = await this.getDatabase();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `
INSERT INTO decks (
  id,
  collection_id,
  name,
  description,
  auto_generate_reverse_cards,
  created_at,
  updated_at,
  archived_at
) VALUES (
  $id,
  $collectionId,
  $name,
  $description,
  $autoGenerateReverseCards,
  $createdAt,
  $updatedAt,
  $archivedAt
)`,
        {
          $id: deck.id,
          $collectionId: deck.collectionId,
          $name: deck.name,
          $description: deck.description ?? null,
          $autoGenerateReverseCards: deck.autoGenerateReverseCards ? 1 : 0,
          $createdAt: deck.createdAt,
          $updatedAt: deck.updatedAt,
          $archivedAt: deck.archivedAt ?? null,
        },
      );

      await db.runAsync(
        `
UPDATE collections
SET updated_at = $updatedAt
WHERE id = $collectionId
  AND archived_at IS NULL
`,
        {
          $collectionId: deck.collectionId,
          $updatedAt: deck.updatedAt,
        },
      );
    });

    return deck;
  }

  async listActiveByCollection(collectionId: string): Promise<Deck[]> {
    const db = await this.getDatabase();
    const rows = await db.getAllAsync<DeckRow>(
      `
SELECT
  id,
  collection_id AS collectionId,
  name,
  description,
  auto_generate_reverse_cards AS autoGenerateReverseCards,
  created_at AS createdAt,
  updated_at AS updatedAt,
  archived_at AS archivedAt
FROM decks
WHERE collection_id = $collectionId
  AND archived_at IS NULL
ORDER BY updated_at DESC, created_at DESC
`,
      { $collectionId: collectionId },
    );

    return rows.map(mapDeck);
  }

  async findById(id: string): Promise<Deck | null> {
    const db = await this.getDatabase();
    const row = await db.getFirstAsync<DeckRow>(
      `
SELECT
  id,
  collection_id AS collectionId,
  name,
  description,
  auto_generate_reverse_cards AS autoGenerateReverseCards,
  created_at AS createdAt,
  updated_at AS updatedAt,
  archived_at AS archivedAt
FROM decks
WHERE id = $id
  AND archived_at IS NULL
LIMIT 1
`,
      { $id: id },
    );

    return row ? mapDeck(row) : null;
  }
}
