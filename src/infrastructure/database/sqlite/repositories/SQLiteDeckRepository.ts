import type { Deck } from '@/domain/entities/Deck';
import type { DeckRepository } from '@/domain/repositories/DeckRepository';

import type { SqliteDatabaseConnection } from '../types';

type GetDatabase = () => Promise<SqliteDatabaseConnection>;

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
}
