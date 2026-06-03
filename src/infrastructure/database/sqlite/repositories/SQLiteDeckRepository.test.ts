import type { Deck } from '@/domain/entities/Deck';

import { SQLiteDeckRepository } from './SQLiteDeckRepository';
import type { SqliteDatabaseConnection } from '../types';

class FakeDeckDatabase {
  runCalls: Array<{ source: string; params: unknown[] }> = [];
  transactionCount = 0;

  async execAsync(): Promise<void> {}

  async runAsync(source: string, ...params: unknown[]): Promise<unknown> {
    this.runCalls.push({ source, params });
    return {};
  }

  async getAllAsync<T>(): Promise<T[]> {
    return [];
  }

  async getFirstAsync<T>(): Promise<T | null> {
    return null;
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
});
