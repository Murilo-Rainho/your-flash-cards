import { describe, expect, it } from '@jest/globals';

import { SQLiteAppSettingsRepository } from '@/infrastructure/database/sqlite/repositories/SQLiteAppSettingsRepository';
import type { SqliteDatabaseConnection } from '@/infrastructure/database/sqlite/types';

class FakeAppSettingsDatabase {
  runCalls: Array<{ source: string; params: unknown }> = [];
  firstCalls: Array<{ source: string; params: unknown }> = [];
  allCalls: Array<{ source: string; params: unknown }> = [];

  firstRow: unknown | null = null;
  allRows: unknown[] = [];

  async execAsync(): Promise<void> {}

  async runAsync(source: string, params?: unknown): Promise<unknown> {
    this.runCalls.push({ source, params });
    return {};
  }

  async getFirstAsync<T>(source: string, params?: unknown): Promise<T | null> {
    this.firstCalls.push({ source, params });
    return this.firstRow as T | null;
  }

  async getAllAsync<T>(source: string, params?: unknown): Promise<T[]> {
    this.allCalls.push({ source, params });
    return this.allRows as T[];
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    await task();
  }

  asConnection(): SqliteDatabaseConnection {
    return this as unknown as SqliteDatabaseConnection;
  }
}

function createRepository(db: FakeAppSettingsDatabase): SQLiteAppSettingsRepository {
  return new SQLiteAppSettingsRepository(async () => db.asConnection());
}

describe('SQLiteAppSettingsRepository', () => {
  it('returns null when the key does not exist', async () => {
    const db = new FakeAppSettingsDatabase();
    db.firstRow = null;

    await expect(createRepository(db).get('ui.locale')).resolves.toBeNull();
    expect(db.firstCalls[0]?.source).toContain('FROM app_settings');
  });

  it('persists value with upsert', async () => {
    const db = new FakeAppSettingsDatabase();

    await createRepository(db).set('ui.locale', 'en-US');

    expect(db.runCalls[0]?.source).toContain('INSERT INTO app_settings');
    expect(db.runCalls[0]?.source).toContain('ON CONFLICT(key) DO UPDATE');
    expect(db.runCalls[0]?.params).toEqual({
      $key: 'ui.locale',
      $value: 'en-US',
      $updatedAt: expect.any(String),
    });
  });

  it('returns map with null for missing keys in getMany', async () => {
    const db = new FakeAppSettingsDatabase();
    db.allRows = [{ key: 'ui.locale', value: 'pt-BR' }];

    await expect(createRepository(db).getMany(['ui.locale', 'theme.palette'])).resolves.toEqual({
      'ui.locale': 'pt-BR',
      'theme.palette': null,
    });
  });
});
