import type { Collection } from '@/domain/entities/Collection';
import type { CollectionRepository } from '@/domain/repositories/CollectionRepository';

import type { SqliteDatabaseConnection } from '../types';

type GetDatabase = () => Promise<SqliteDatabaseConnection>;

type CollectionRow = {
  id: string;
  name: string;
  baseLanguage: string;
  targetLanguage: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
};

function mapCollection(row: CollectionRow): Collection {
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

export class SQLiteCollectionRepository implements CollectionRepository {
  constructor(private readonly getDatabase: GetDatabase) {}

  async create(collection: Collection): Promise<Collection> {
    const db = await this.getDatabase();

    await db.runAsync(
      `
INSERT INTO collections (
  id,
  name,
  base_language,
  target_language,
  description,
  created_at,
  updated_at,
  archived_at
) VALUES (
  $id,
  $name,
  $baseLanguage,
  $targetLanguage,
  $description,
  $createdAt,
  $updatedAt,
  $archivedAt
)`,
      {
        $id: collection.id,
        $name: collection.name,
        $baseLanguage: collection.baseLanguage,
        $targetLanguage: collection.targetLanguage,
        $description: collection.description ?? null,
        $createdAt: collection.createdAt,
        $updatedAt: collection.updatedAt,
        $archivedAt: collection.archivedAt ?? null,
      },
    );

    return collection;
  }

  async update(collection: Collection): Promise<Collection> {
    const db = await this.getDatabase();

    await db.runAsync(
      `
UPDATE collections
SET name = $name,
    description = $description,
    updated_at = $updatedAt
WHERE id = $id
  AND archived_at IS NULL
`,
      {
        $id: collection.id,
        $name: collection.name,
        $description: collection.description ?? null,
        $updatedAt: collection.updatedAt,
      },
    );

    return collection;
  }

  async listActive(): Promise<Collection[]> {
    const db = await this.getDatabase();
    const rows = await db.getAllAsync<CollectionRow>(
      `
SELECT
  id,
  name,
  base_language AS baseLanguage,
  target_language AS targetLanguage,
  description,
  created_at AS createdAt,
  updated_at AS updatedAt,
  archived_at AS archivedAt
FROM collections
WHERE archived_at IS NULL
ORDER BY updated_at DESC, created_at DESC
`,
    );

    return rows.map(mapCollection);
  }

  async findById(id: string): Promise<Collection | null> {
    const db = await this.getDatabase();
    const row = await db.getFirstAsync<CollectionRow>(
      `
SELECT
  id,
  name,
  base_language AS baseLanguage,
  target_language AS targetLanguage,
  description,
  created_at AS createdAt,
  updated_at AS updatedAt,
  archived_at AS archivedAt
FROM collections
WHERE id = $id
  AND archived_at IS NULL
LIMIT 1
`,
      { $id: id },
    );

    return row ? mapCollection(row) : null;
  }
}
