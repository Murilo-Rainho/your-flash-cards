import { describe, expect, it } from '@jest/globals';

import type { Collection } from '@/domain/entities/Collection';

import { SQLiteCollectionRepository } from '@/infrastructure/database/sqlite/repositories/SQLiteCollectionRepository';
import type { SqliteDatabaseConnection } from '@/infrastructure/database/sqlite/types';

class FakeCollectionDatabase {
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

function createRepository(db: FakeCollectionDatabase): SQLiteCollectionRepository {
  return new SQLiteCollectionRepository(async () => db.asConnection());
}

const collection: Collection = {
  id: 'collection-pt-en',
  name: 'Português para Inglês',
  baseLanguage: 'pt',
  targetLanguage: 'en',
  description: undefined,
  createdAt: '2026-06-03T12:00:00.000Z',
  updatedAt: '2026-06-03T12:00:00.000Z',
};

describe('SQLiteCollectionRepository', () => {
  it('inserts a collection into the local collections table', async () => {
    const db = new FakeCollectionDatabase();

    await expect(createRepository(db).create(collection)).resolves.toBe(collection);

    expect(db.runCalls[0]?.source).toContain('INSERT INTO collections');
    expect(db.runCalls[0]?.params[0]).toEqual({
      $id: 'collection-pt-en',
      $name: 'Português para Inglês',
      $baseLanguage: 'pt',
      $targetLanguage: 'en',
      $description: null,
      $createdAt: '2026-06-03T12:00:00.000Z',
      $updatedAt: '2026-06-03T12:00:00.000Z',
      $archivedAt: null,
    });
  });

  it('lists only active collections and maps nullable fields', async () => {
    const db = new FakeCollectionDatabase();
    db.allRows = [
      {
        id: 'collection-pt-en',
        name: 'Português para Inglês',
        baseLanguage: 'pt',
        targetLanguage: 'en',
        description: null,
        createdAt: '2026-06-01T12:00:00.000Z',
        updatedAt: '2026-06-03T12:00:00.000Z',
        archivedAt: null,
      },
    ];

    await expect(createRepository(db).listActive()).resolves.toEqual([
      {
        id: 'collection-pt-en',
        name: 'Português para Inglês',
        baseLanguage: 'pt',
        targetLanguage: 'en',
        description: undefined,
        createdAt: '2026-06-01T12:00:00.000Z',
        updatedAt: '2026-06-03T12:00:00.000Z',
        archivedAt: undefined,
      },
    ]);

    expect(db.allCalls[0]?.source).toContain('WHERE archived_at IS NULL');
    expect(db.allCalls[0]?.source).toContain('ORDER BY updated_at DESC, created_at DESC');
  });

  it('finds an active collection by id', async () => {
    const db = new FakeCollectionDatabase();
    db.firstRow = {
      id: 'collection-pt-en',
      name: 'Português para Inglês',
      baseLanguage: 'pt',
      targetLanguage: 'en',
      description: 'Base',
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-03T12:00:00.000Z',
      archivedAt: null,
    };

    await expect(createRepository(db).findById('collection-pt-en')).resolves.toEqual({
      id: 'collection-pt-en',
      name: 'Português para Inglês',
      baseLanguage: 'pt',
      targetLanguage: 'en',
      description: 'Base',
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-03T12:00:00.000Z',
      archivedAt: undefined,
    });

    expect(db.firstCalls[0]?.source).toContain('WHERE id = $id');
    expect(db.firstCalls[0]?.source).toContain('AND archived_at IS NULL');
    expect(db.firstCalls[0]?.params[0]).toEqual({ $id: 'collection-pt-en' });
  });
});
