import { createLocalId } from '@/utils/ids';

import type { SqliteDatabaseConnection } from '../types';
import type { SqliteMigration } from './types';

type OldTagRow = {
  id: string;
  name: string;
  normalized_name: string;
  created_at: string;
  updated_at: string;
};

type CardCollectionLinkRow = {
  card_id: string;
  collection_id: string;
};

/**
 * Copies global tags to `tags_new` with collection scope and reassociates `card_tags`.
 *
 * - Orphan tags (no cards) are discarded.
 * - Tags in one collection keep the original `id`.
 * - Tags in N collections duplicate the record (1 per collection) and update links.
 */
export async function migrateTagsToCollectionScope(db: SqliteDatabaseConnection): Promise<void> {
  const tags = await db.getAllAsync<OldTagRow>(`
SELECT
  id,
  name,
  normalized_name,
  created_at,
  updated_at
FROM tags
`);

  for (const tag of tags) {
    const links = await db.getAllAsync<CardCollectionLinkRow>(
      `
SELECT
  ct.card_id,
  d.collection_id
FROM card_tags ct
INNER JOIN cards c ON c.id = ct.card_id
INNER JOIN decks d ON d.id = c.deck_id
WHERE ct.tag_id = ?
`,
      [tag.id],
    );

    const collectionIds = [...new Set(links.map((link) => link.collection_id))].sort();

    if (collectionIds.length === 0) {
      continue;
    }

    const tagIdByCollection = new Map<string, string>();
    tagIdByCollection.set(collectionIds[0], tag.id);

    for (let index = 1; index < collectionIds.length; index += 1) {
      tagIdByCollection.set(collectionIds[index], createLocalId('tag'));
    }

    for (const [collectionId, tagId] of tagIdByCollection) {
      await db.runAsync(
        `
INSERT INTO tags_new (
  id,
  collection_id,
  name,
  normalized_name,
  created_at,
  updated_at
) VALUES (?, ?, ?, ?, ?, ?)
`,
        [tagId, collectionId, tag.name, tag.normalized_name, tag.created_at, tag.updated_at],
      );
    }

    for (const link of links) {
      const scopedTagId = tagIdByCollection.get(link.collection_id);

      if (!scopedTagId || scopedTagId === tag.id) {
        continue;
      }

      await db.runAsync(
        `
UPDATE card_tags
SET tag_id = ?
WHERE card_id = ?
  AND tag_id = ?
`,
        [scopedTagId, link.card_id, tag.id],
      );
    }
  }
}

export const tagsCollectionScopeMigration: SqliteMigration = {
  version: '002_tags_collection_scope',
  description: 'Scope tags to collections with composite uniqueness.',
  statements: [
    `
CREATE TABLE IF NOT EXISTS tags_new (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (collection_id, normalized_name),
  FOREIGN KEY (collection_id) REFERENCES collections (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
)`,
  ],
  migrateData: migrateTagsToCollectionScope,
  finalizeStatements: [
    'DROP TABLE tags',
    'ALTER TABLE tags_new RENAME TO tags',
    'CREATE INDEX IF NOT EXISTS idx_tags_collection_id ON tags (collection_id)',
  ],
} as const;
