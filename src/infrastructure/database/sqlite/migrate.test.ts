import { describe, expect, it } from '@jest/globals';

import { migrateSqliteDatabase } from './migrate';
import type { SqliteDatabaseConnection } from './types';

class FakeMigrationDatabase {
  execStatements: string[] = [];
  runCalls: Array<{ source: string; params: unknown[] }> = [];
  transactionCount = 0;

  constructor(private readonly alreadyApplied = false) {}

  async execAsync(source: string): Promise<void> {
    this.execStatements.push(source);
  }

  async runAsync(source: string, ...params: unknown[]): Promise<unknown> {
    this.runCalls.push({ source, params });
    return {};
  }

  async getFirstAsync<T>(): Promise<T | null> {
    return this.alreadyApplied ? ({ version: '001_initial_schema' } as T) : null;
  }

  async getAllAsync<T>(): Promise<T[]> {
    return [];
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    this.transactionCount += 1;
    await task();
  }

  asConnection(): SqliteDatabaseConnection {
    return this as unknown as SqliteDatabaseConnection;
  }
}

describe('migrateSqliteDatabase', () => {
  it('applies unapplied migrations and records their versions', async () => {
    const db = new FakeMigrationDatabase();

    await migrateSqliteDatabase(db.asConnection());

    expect(db.execStatements[0]).toBe('PRAGMA foreign_keys = ON');
    expect(db.execStatements[1]).toContain('CREATE TABLE IF NOT EXISTS schema_migrations');
    expect(db.execStatements).toEqual(
      expect.arrayContaining([
        expect.stringContaining('CREATE TABLE IF NOT EXISTS collections'),
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_review_items_due'),
        expect.stringContaining('ALTER TABLE cards ADD COLUMN cloze_data'),
        expect.stringContaining('ALTER TABLE cards ADD COLUMN front_search'),
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_cards_deck_active_order'),
      ]),
    );
    expect(
      db.execStatements.filter((statement) => statement === 'PRAGMA foreign_keys = ON'),
    ).toHaveLength(1);
    expect(db.transactionCount).toBe(4);
    expect(db.runCalls[0]?.source).toBe(
      'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
    );
    expect(db.runCalls[0]?.params[0]).toEqual(['001_initial_schema', expect.any(String)]);
    expect(db.runCalls[1]?.params[0]).toEqual(['002_tags_collection_scope', expect.any(String)]);
    expect(db.runCalls[2]?.params[0]).toEqual(['003_cloze_multi', expect.any(String)]);
    expect(db.runCalls[3]?.params[0]).toEqual(['004_card_list_search', expect.any(String)]);
  });

  it('skips already applied migrations', async () => {
    const db = new FakeMigrationDatabase(true);

    await migrateSqliteDatabase(db.asConnection());

    expect(db.transactionCount).toBe(0);
    expect(db.runCalls).toEqual([]);
    expect(db.execStatements).toHaveLength(2);
  });
});
