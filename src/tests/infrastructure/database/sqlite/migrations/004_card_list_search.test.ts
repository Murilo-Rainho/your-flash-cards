import { describe, expect, it } from '@jest/globals';

import type { SqliteDatabaseConnection } from '@/infrastructure/database/sqlite/types';
import {
  backfillCardSearchProjections,
  cardListSearchMigration,
} from '@/infrastructure/database/sqlite/migrations/004_card_list_search';

type CardSearchRow = {
  id: string;
  front: string;
  back: string;
};

class FakeMigrationDatabase {
  cards: CardSearchRow[] = [];
  getAllCalls: Array<Record<string, unknown>> = [];
  updates: Array<Record<string, unknown>> = [];

  async execAsync(): Promise<void> {}

  async runAsync(_source: string, params: Record<string, unknown>): Promise<unknown> {
    this.updates.push(params);
    return {};
  }

  async getAllAsync<T>(_source: string, params: Record<string, unknown>): Promise<T[]> {
    this.getAllCalls.push(params);
    const lastId = params.$lastId as string | null;
    const limit = params.$limit as number;
    return this.cards.filter((card) => lastId === null || card.id > lastId).slice(0, limit) as T[];
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

describe('cardListSearchMigration', () => {
  it('adds normalized projections and a stable pagination index', () => {
    const sql = [
      ...cardListSearchMigration.statements,
      ...(cardListSearchMigration.finalizeStatements ?? []),
    ]
      .join(' ')
      .replace(/\s+/g, ' ');

    expect(sql).toContain("front_search TEXT NOT NULL DEFAULT ''");
    expect(sql).toContain("back_search TEXT NOT NULL DEFAULT ''");
    expect(sql).toContain(
      'ON cards (deck_id, archived_at, updated_at DESC, created_at DESC, id DESC)',
    );
  });

  it('backfills case and accent insensitive values in bounded batches', async () => {
    const db = new FakeMigrationDatabase();
    db.cards = Array.from({ length: 201 }, (_, index) => ({
      id: `card-${String(index).padStart(3, '0')}`,
      front: index === 0 ? '  CAFÉ  ' : `Front ${index}`,
      back: index === 0 ? 'Ação RÁPIDA' : `Back ${index}`,
    }));

    await backfillCardSearchProjections(db.asConnection());

    expect(db.getAllCalls).toHaveLength(3);
    expect(db.getAllCalls[0]).toEqual({ $lastId: null, $limit: 200 });
    expect(db.getAllCalls[1]).toEqual({ $lastId: 'card-199', $limit: 200 });
    expect(db.updates).toHaveLength(201);
    expect(db.updates[0]).toEqual({
      $id: 'card-000',
      $frontSearch: 'cafe',
      $backSearch: 'acao rapida',
    });
  });
});
