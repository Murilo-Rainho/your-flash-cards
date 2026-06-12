import { describe, expect, it } from '@jest/globals';

import {
  migrateTagsToCollectionScope,
  tagsCollectionScopeMigration,
} from './002_tags_collection_scope';
import type { SqliteDatabaseConnection } from '../types';

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

class FakeMigrationDatabase {
  tags: OldTagRow[] = [];
  linksByTagId = new Map<string, CardCollectionLinkRow[]>();
  insertedTags: Array<Record<string, unknown>> = [];
  updatedCardTags: Array<{ tagId: string; cardId: string; oldTagId: string }> = [];

  async execAsync(): Promise<void> {}

  async runAsync(source: string, ...params: unknown[]): Promise<unknown> {
    const values = Array.isArray(params[0]) ? params[0] : params;

    if (source.includes('INSERT INTO tags_new')) {
      this.insertedTags.push({
        id: values[0],
        collection_id: values[1],
        name: values[2],
        normalized_name: values[3],
        created_at: values[4],
        updated_at: values[5],
      });
    }

    if (source.includes('UPDATE card_tags')) {
      this.updatedCardTags.push({
        tagId: values[0] as string,
        cardId: values[1] as string,
        oldTagId: values[2] as string,
      });
    }

    return {};
  }

  async getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]> {
    if (source.includes('FROM tags')) {
      return this.tags as T[];
    }

    if (source.includes('FROM card_tags')) {
      const values = Array.isArray(params[0]) ? params[0] : params;
      const tagId = values[0] as string;
      return (this.linksByTagId.get(tagId) ?? []) as T[];
    }

    return [];
  }

  async getFirstAsync<T>(): Promise<T | null> {
    return null;
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    await task();
  }

  asConnection(): SqliteDatabaseConnection {
    return this as unknown as SqliteDatabaseConnection;
  }
}

const migrationSql = [
  ...tagsCollectionScopeMigration.statements,
  ...(tagsCollectionScopeMigration.finalizeStatements ?? []),
]
  .join('\n')
  .replace(/\s+/g, ' ');

function createTableSql(tableName: string): string {
  const statement = tagsCollectionScopeMigration.statements.find((migrationStatement) =>
    migrationStatement.trimStart().startsWith(`CREATE TABLE IF NOT EXISTS ${tableName}`),
  );

  if (!statement) {
    throw new Error(`CREATE TABLE statement not found for ${tableName}`);
  }

  return statement.replace(/\s+/g, ' ');
}

describe('tagsCollectionScopeMigration', () => {
  it('models collection-scoped tags with composite uniqueness', () => {
    const tagsSql = createTableSql('tags_new');

    expect(tagsSql).toContain('collection_id TEXT NOT NULL');
    expect(tagsSql).toContain('UNIQUE (collection_id, normalized_name)');
    expect(tagsSql).toContain('FOREIGN KEY (collection_id) REFERENCES collections (id)');
  });

  it('creates the collection index and swaps tables after data migration', () => {
    expect(migrationSql).toContain('DROP TABLE tags');
    expect(migrationSql).toContain('ALTER TABLE tags_new RENAME TO tags');
    expect(migrationSql).toContain(
      'CREATE INDEX IF NOT EXISTS idx_tags_collection_id ON tags (collection_id)',
    );
  });

  it('discards orphan tags without linked cards', async () => {
    const db = new FakeMigrationDatabase();
    db.tags = [
      {
        id: 'tag-orphan',
        name: 'unused',
        normalized_name: 'unused',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
    ];

    await migrateTagsToCollectionScope(db.asConnection());

    expect(db.insertedTags).toEqual([]);
    expect(db.updatedCardTags).toEqual([]);
  });

  it('scopes a tag used in one collection preserving its id', async () => {
    const db = new FakeMigrationDatabase();
    db.tags = [
      {
        id: 'tag-travel',
        name: 'Travel',
        normalized_name: 'travel',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
    ];
    db.linksByTagId.set('tag-travel', [{ card_id: 'card-1', collection_id: 'collection-pt-en' }]);

    await migrateTagsToCollectionScope(db.asConnection());

    expect(db.insertedTags).toEqual([
      {
        id: 'tag-travel',
        collection_id: 'collection-pt-en',
        name: 'Travel',
        normalized_name: 'travel',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
    ]);
    expect(db.updatedCardTags).toEqual([]);
  });

  it('duplicates a tag used in multiple collections and reassigns card links', async () => {
    const db = new FakeMigrationDatabase();
    db.tags = [
      {
        id: 'tag-restaurant',
        name: 'restaurant',
        normalized_name: 'restaurant',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
    ];
    db.linksByTagId.set('tag-restaurant', [
      { card_id: 'card-en', collection_id: 'collection-pt-en' },
      { card_id: 'card-es', collection_id: 'collection-pt-es' },
    ]);

    await migrateTagsToCollectionScope(db.asConnection());

    expect(db.insertedTags).toHaveLength(2);
    expect(db.insertedTags[0]).toMatchObject({
      id: 'tag-restaurant',
      collection_id: 'collection-pt-en',
      normalized_name: 'restaurant',
    });
    expect(db.insertedTags[1]).toMatchObject({
      collection_id: 'collection-pt-es',
      normalized_name: 'restaurant',
    });
    expect(db.insertedTags[1]?.id).not.toBe('tag-restaurant');
    expect(db.updatedCardTags).toEqual([
      {
        tagId: db.insertedTags[1]?.id,
        cardId: 'card-es',
        oldTagId: 'tag-restaurant',
      },
    ]);
  });
});
