import { describe, expect, it } from '@jest/globals';

import type { Tag } from '@/domain/entities/Tag';

import { SQLiteTagRepository } from './SQLiteTagRepository';
import type { SqliteDatabaseConnection } from '../types';

class FakeTagDatabase {
  runCalls: Array<{ source: string; params: unknown[] }> = [];
  allCalls: Array<{ source: string; params: unknown[] }> = [];
  firstCalls: Array<{ source: string; params: unknown[] }> = [];

  allRows: unknown[] = [];
  firstRow: unknown | null = null;

  async execAsync(): Promise<void> {}

  async runAsync(source: string, ...params: unknown[]): Promise<unknown> {
    this.runCalls.push({ source, params });
    return {};
  }

  async getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]> {
    this.allCalls.push({ source, params });
    return this.allRows as T[];
  }

  async getFirstAsync<T>(source: string, ...params: unknown[]): Promise<T | null> {
    this.firstCalls.push({ source, params });
    return this.firstRow as T | null;
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    await task();
  }

  asConnection(): SqliteDatabaseConnection {
    return this as unknown as SqliteDatabaseConnection;
  }
}

function createRepository(db: FakeTagDatabase): SQLiteTagRepository {
  return new SQLiteTagRepository(async () => db.asConnection());
}

const tag: Tag = {
  id: 'tag-1',
  collectionId: 'collection-pt-en',
  name: 'Travel',
  normalizedName: 'travel',
  createdAt: '2026-06-05T12:00:00.000Z',
  updatedAt: '2026-06-05T12:00:00.000Z',
};

describe('SQLiteTagRepository', () => {
  it('upserts by collection and normalized_name and returns the stored canonical row', async () => {
    const db = new FakeTagDatabase();
    db.firstRow = {
      id: 'tag-existente',
      collectionId: 'collection-pt-en',
      name: 'Travel',
      normalizedName: 'travel',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-06-05T12:00:00.000Z',
    };

    await expect(createRepository(db).createIfAbsent(tag)).resolves.toEqual({
      id: 'tag-existente',
      collectionId: 'collection-pt-en',
      name: 'Travel',
      normalizedName: 'travel',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-06-05T12:00:00.000Z',
    });

    expect(db.runCalls[0]?.source).toContain('INSERT OR IGNORE INTO tags');
    expect(db.runCalls[0]?.source).toContain('collection_id');
    expect(db.runCalls[1]?.source).toContain('UPDATE tags');
    expect(db.firstCalls[0]?.source).toContain('WHERE collection_id = $collectionId');
    expect(db.firstCalls[0]?.params[0]).toEqual({
      $collectionId: 'collection-pt-en',
      $normalizedName: 'travel',
    });
  });

  it('returns the tag itself when no row is found after insert', async () => {
    const db = new FakeTagDatabase();
    db.firstRow = null;

    await expect(createRepository(db).createIfAbsent(tag)).resolves.toBe(tag);
  });

  it('lists collection tags ordered by name and maps fields', async () => {
    const db = new FakeTagDatabase();
    db.allRows = [
      {
        id: 'tag-1',
        collectionId: 'collection-pt-en',
        name: 'Travel',
        normalizedName: 'travel',
        createdAt: '2026-06-01T12:00:00.000Z',
        updatedAt: '2026-06-03T12:00:00.000Z',
      },
    ];

    await expect(createRepository(db).listByCollection('collection-pt-en')).resolves.toEqual([
      {
        id: 'tag-1',
        collectionId: 'collection-pt-en',
        name: 'Travel',
        normalizedName: 'travel',
        createdAt: '2026-06-01T12:00:00.000Z',
        updatedAt: '2026-06-03T12:00:00.000Z',
      },
    ]);

    expect(db.allCalls[0]?.source).toContain('FROM tags');
    expect(db.allCalls[0]?.source).toContain('WHERE collection_id = $collectionId');
    expect(db.allCalls[0]?.source).toContain('ORDER BY name COLLATE NOCASE ASC');
    expect(db.allCalls[0]?.params[0]).toEqual({ $collectionId: 'collection-pt-en' });
  });

  it('finds tag by id', async () => {
    const db = new FakeTagDatabase();
    db.firstRow = {
      id: 'tag-1',
      collectionId: 'collection-pt-en',
      name: 'Travel',
      normalizedName: 'travel',
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-03T12:00:00.000Z',
    };

    await expect(createRepository(db).findById('tag-1')).resolves.toEqual({
      id: 'tag-1',
      collectionId: 'collection-pt-en',
      name: 'Travel',
      normalizedName: 'travel',
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-03T12:00:00.000Z',
    });

    expect(db.firstCalls[0]?.source).toContain('WHERE id = $id');
  });

  it('updates name and normalized key', async () => {
    const db = new FakeTagDatabase();

    await createRepository(db).update({
      ...tag,
      name: 'Business',
      normalizedName: 'business',
      updatedAt: '2026-06-06T12:00:00.000Z',
    });

    expect(db.runCalls[0]?.source).toContain('UPDATE tags');
    expect(db.runCalls[0]?.params[0]).toEqual({
      $id: 'tag-1',
      $name: 'Business',
      $normalizedName: 'business',
      $updatedAt: '2026-06-06T12:00:00.000Z',
    });
  });

  it('deletes tag by id', async () => {
    const db = new FakeTagDatabase();

    await createRepository(db).delete('tag-1');

    expect(db.runCalls[0]?.source).toContain('DELETE FROM tags');
    expect(db.runCalls[0]?.params[0]).toEqual({ $id: 'tag-1' });
  });
});
