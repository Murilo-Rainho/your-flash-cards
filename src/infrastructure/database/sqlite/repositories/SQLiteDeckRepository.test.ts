import { describe, expect, it } from '@jest/globals';

import type { Deck } from '@/domain/entities/Deck';

import { SQLiteDeckRepository } from './SQLiteDeckRepository';
import type { SqliteDatabaseConnection } from '../types';

class FakeDeckDatabase {
  runCalls: Array<{ source: string; params: unknown[] }> = [];
  getAllCalls: Array<{ source: string; params: unknown[] }> = [];
  getFirstCalls: Array<{ source: string; params: unknown[] }> = [];
  transactionCount = 0;
  allRows: unknown[] = [];
  firstRow: unknown | null = null;

  async execAsync(): Promise<void> {}

  async runAsync(source: string, ...params: unknown[]): Promise<unknown> {
    this.runCalls.push({ source, params });
    return {};
  }

  async getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]> {
    this.getAllCalls.push({ source, params });
    return this.allRows as T[];
  }

  async getFirstAsync<T>(source: string, ...params: unknown[]): Promise<T | null> {
    this.getFirstCalls.push({ source, params });
    return this.firstRow as T | null;
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    this.transactionCount += 1;
    await task();
  }

  asConnection(): SqliteDatabaseConnection {
    return this as unknown as SqliteDatabaseConnection;
  }
}

function createRepository(db: FakeDeckDatabase): SQLiteDeckRepository {
  return new SQLiteDeckRepository(async () => db.asConnection());
}

const deck: Deck = {
  id: 'deck-travel',
  collectionId: 'collection-pt-en',
  name: 'Travel',
  description: undefined,
  autoGenerateReverseCards: true,
  createdAt: '2026-06-03T12:00:00.000Z',
  updatedAt: '2026-06-03T12:00:00.000Z',
};

describe('SQLiteDeckRepository', () => {
  it('inserts a deck and updates the parent collection inside a transaction', async () => {
    const db = new FakeDeckDatabase();

    await expect(createRepository(db).create(deck)).resolves.toBe(deck);

    expect(db.transactionCount).toBe(1);
    expect(db.runCalls[0]?.source).toContain('INSERT INTO decks');
    expect(db.runCalls[0]?.params[0]).toEqual({
      $id: 'deck-travel',
      $collectionId: 'collection-pt-en',
      $name: 'Travel',
      $description: null,
      $autoGenerateReverseCards: 1,
      $createdAt: '2026-06-03T12:00:00.000Z',
      $updatedAt: '2026-06-03T12:00:00.000Z',
      $archivedAt: null,
    });
    expect(db.runCalls[1]?.source).toContain('UPDATE collections');
    expect(db.runCalls[1]?.source).toContain('SET updated_at = $updatedAt');
    expect(db.runCalls[1]?.params[0]).toEqual({
      $collectionId: 'collection-pt-en',
      $updatedAt: '2026-06-03T12:00:00.000Z',
    });
  });

  it('lists active decks by collection', async () => {
    const db = new FakeDeckDatabase();
    db.allRows = [
      {
        id: 'deck-travel',
        collectionId: 'collection-pt-en',
        name: 'Travel',
        description: null,
        autoGenerateReverseCards: 1,
        createdAt: '2026-06-03T12:00:00.000Z',
        updatedAt: '2026-06-03T12:00:00.000Z',
        archivedAt: null,
      },
    ];

    await expect(createRepository(db).listActiveByCollection('collection-pt-en')).resolves.toEqual([
      deck,
    ]);

    expect(db.getAllCalls[0]?.source).toContain('WHERE collection_id = $collectionId');
    expect(db.getAllCalls[0]?.source).toContain('AND archived_at IS NULL');
    expect(db.getAllCalls[0]?.params[0]).toEqual({ $collectionId: 'collection-pt-en' });
  });

  it('finds an active deck by id', async () => {
    const db = new FakeDeckDatabase();
    db.firstRow = {
      id: 'deck-travel',
      collectionId: 'collection-pt-en',
      name: 'Travel',
      description: null,
      autoGenerateReverseCards: 1,
      createdAt: '2026-06-03T12:00:00.000Z',
      updatedAt: '2026-06-03T12:00:00.000Z',
      archivedAt: null,
    };

    await expect(createRepository(db).findById('deck-travel')).resolves.toEqual(deck);

    expect(db.getFirstCalls[0]?.source).toContain('WHERE id = $id');
    expect(db.getFirstCalls[0]?.source).toContain('AND archived_at IS NULL');
    expect(db.getFirstCalls[0]?.params[0]).toEqual({ $id: 'deck-travel' });
  });
});
