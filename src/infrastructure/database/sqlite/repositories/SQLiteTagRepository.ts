import type { Tag } from '@/domain/entities/Tag';
import type { TagRepository } from '@/domain/repositories/TagRepository';

import type { SqliteDatabaseConnection } from '../types';

type GetDatabase = () => Promise<SqliteDatabaseConnection>;

type TagRow = {
  id: string;
  name: string;
  normalizedName: string;
  createdAt: string;
  updatedAt: string;
};

function mapTag(row: TagRow): Tag {
  return {
    id: row.id,
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

      const row = await db.getFirstAsync<TagRow>(
        `
SELECT
  id,
  name,
  normalized_name AS normalizedName,
  created_at AS createdAt,
  updated_at AS updatedAt
FROM tags
WHERE normalized_name = $normalizedName
LIMIT 1
`,
        { $normalizedName: tag.normalizedName },
      );

      if (row) {
        storedTag = mapTag(row);
      }
    });

    return storedTag;
  }

  async listAll(): Promise<Tag[]> {
    const db = await this.getDatabase();
    const rows = await db.getAllAsync<TagRow>(
      `
SELECT
  id,
  name,
  normalized_name AS normalizedName,
  created_at AS createdAt,
  updated_at AS updatedAt
FROM tags
ORDER BY name COLLATE NOCASE ASC
`,
    );

    return rows.map(mapTag);
  }
}
