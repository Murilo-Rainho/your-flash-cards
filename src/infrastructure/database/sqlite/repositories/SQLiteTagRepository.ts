import type { Tag } from '@/domain/entities/Tag';
import type { TagRepository } from '@/domain/repositories/TagRepository';

import type { SqliteDatabaseConnection } from '../types';

type GetDatabase = () => Promise<SqliteDatabaseConnection>;

type TagRow = {
  id: string;
  collectionId: string;
  name: string;
  normalizedName: string;
  createdAt: string;
  updatedAt: string;
};

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

export class SQLiteTagRepository implements TagRepository {
  constructor(private readonly getDatabase: GetDatabase) {}

  async createIfAbsent(tag: Tag): Promise<Tag> {
    const db = await this.getDatabase();
    let storedTag: Tag = tag;

    await db.withTransactionAsync(async () => {
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

      const row = await db.getFirstAsync<TagRow>(
        `
SELECT
  id,
  collection_id AS collectionId,
  name,
  normalized_name AS normalizedName,
  created_at AS createdAt,
  updated_at AS updatedAt
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

      if (row) {
        storedTag = mapTag(row);
      }
    });

    return storedTag;
  }

  async listByCollection(collectionId: string): Promise<Tag[]> {
    const db = await this.getDatabase();
    const rows = await db.getAllAsync<TagRow>(
      `
SELECT
  id,
  collection_id AS collectionId,
  name,
  normalized_name AS normalizedName,
  created_at AS createdAt,
  updated_at AS updatedAt
FROM tags
WHERE collection_id = $collectionId
ORDER BY name COLLATE NOCASE ASC
`,
      { $collectionId: collectionId },
    );

    return rows.map(mapTag);
  }

  async findById(id: string): Promise<Tag | null> {
    const db = await this.getDatabase();
    const row = await db.getFirstAsync<TagRow>(
      `
SELECT
  id,
  collection_id AS collectionId,
  name,
  normalized_name AS normalizedName,
  created_at AS createdAt,
  updated_at AS updatedAt
FROM tags
WHERE id = $id
LIMIT 1
`,
      { $id: id },
    );

    return row ? mapTag(row) : null;
  }

  async findByCollectionAndNormalizedName(
    collectionId: string,
    normalizedName: string,
  ): Promise<Tag | null> {
    const db = await this.getDatabase();
    const row = await db.getFirstAsync<TagRow>(
      `
SELECT
  id,
  collection_id AS collectionId,
  name,
  normalized_name AS normalizedName,
  created_at AS createdAt,
  updated_at AS updatedAt
FROM tags
WHERE collection_id = $collectionId
  AND normalized_name = $normalizedName
LIMIT 1
`,
      { $collectionId: collectionId, $normalizedName: normalizedName },
    );

    return row ? mapTag(row) : null;
  }

  async update(tag: Tag): Promise<Tag> {
    const db = await this.getDatabase();

    await db.runAsync(
      `
UPDATE tags
SET name = $name,
    normalized_name = $normalizedName,
    updated_at = $updatedAt
WHERE id = $id
`,
      {
        $id: tag.id,
        $name: tag.name,
        $normalizedName: tag.normalizedName,
        $updatedAt: tag.updatedAt,
      },
    );

    return tag;
  }

  async delete(id: string): Promise<void> {
    const db = await this.getDatabase();

    await db.runAsync(`DELETE FROM tags WHERE id = $id`, { $id: id });
  }
}
