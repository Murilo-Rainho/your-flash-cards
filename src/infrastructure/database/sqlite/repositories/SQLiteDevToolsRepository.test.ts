import { INITIAL_REVIEW_ITEM_STATE } from '@/domain/constants/initialReviewItemState';

import { SQLiteDevToolsRepository } from './SQLiteDevToolsRepository';
import type { SqliteDatabaseConnection } from '../types';

class FakeDevDatabase {
  allCalls: Array<{ source: string; params: unknown }> = [];
  runCalls: Array<{ source: string; params: unknown }> = [];
  firstCalls: Array<{ source: string; params: unknown }> = [];
  transactionCount = 0;

  tableNames = [{ name: 'cards' }, { name: 'review_items' }, { name: 'review_logs' }];

  tableRowCounts: Record<string, number> = {
    cards: 2,
    review_items: 3,
    review_logs: 5,
  };

  cardReviewRows = [
    {
      cardId: 'card-1',
      front: 'apple',
      back: 'maçã',
      cardVariantId: 'variant-original',
      variantType: 'original',
      reviewItemId: 'review-item-1',
      repetitions: 5,
      lapses: 2,
      easeFactor: 2.1,
      nextReviewAt: '2026-06-10T10:00:00.000Z',
      lastReviewedAt: '2026-06-05T10:00:00.000Z',
      logCount: 5,
    },
    {
      cardId: 'card-1',
      front: 'apple',
      back: 'maçã',
      cardVariantId: 'variant-reverse',
      variantType: 'reverse',
      reviewItemId: 'review-item-2',
      repetitions: 3,
      lapses: 1,
      easeFactor: 2.3,
      nextReviewAt: '2026-06-08T10:00:00.000Z',
      lastReviewedAt: '2026-06-04T10:00:00.000Z',
      logCount: 3,
    },
  ];

  tableRows: Record<string, Record<string, unknown>[]> = {
    review_items: [
      { id: 'review-item-1', repetitions: 5 },
      { id: 'review-item-2', repetitions: 3 },
    ],
  };

  async getAllAsync<T>(source: string, params?: unknown): Promise<T[]> {
    this.allCalls.push({ source, params });

    if (source.includes('FROM sqlite_master')) {
      return this.tableNames as T[];
    }

    if (source.includes('FROM cards c')) {
      return this.cardReviewRows as T[];
    }

    if (source.includes('SELECT * FROM review_items')) {
      return (this.tableRows.review_items ?? []) as T[];
    }

    return [];
  }

  async getFirstAsync<T>(source: string, params?: unknown): Promise<T | null> {
    this.firstCalls.push({ source, params });

    const tableMatch = source.match(/FROM ([a-z_]+)/i);
    if (tableMatch?.[1]) {
      const tableName = tableMatch[1];
      return { value: this.tableRowCounts[tableName] ?? 0 } as T;
    }

    return null;
  }

  async execAsync(): Promise<void> {}

  async runAsync(source: string, params?: unknown): Promise<{ changes: number }> {
    this.runCalls.push({ source, params });

    if (source.includes('DELETE FROM review_logs')) {
      return { changes: 8 };
    }

    if (source.includes('UPDATE review_items')) {
      return { changes: 2 };
    }

    return { changes: 0 };
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    this.transactionCount += 1;
    await task();
  }

  asConnection(): SqliteDatabaseConnection {
    return this as unknown as SqliteDatabaseConnection;
  }
}

function createRepository(db: FakeDevDatabase): SQLiteDevToolsRepository {
  return new SQLiteDevToolsRepository(async () => db.asConnection());
}

describe('SQLiteDevToolsRepository', () => {
  it('lista tabelas do app sem expor tabelas internas sqlite_%', async () => {
    const db = new FakeDevDatabase();

    await expect(createRepository(db).listTables()).resolves.toEqual([
      { name: 'cards', rowCount: 2 },
      { name: 'review_items', rowCount: 3 },
      { name: 'review_logs', rowCount: 5 },
    ]);

    expect(db.allCalls[0]?.source).toContain("name NOT LIKE 'sqlite_%'");
  });

  it('lista rows apenas de tabelas conhecidas', async () => {
    const db = new FakeDevDatabase();
    const repository = createRepository(db);
    await repository.listTables();

    await expect(
      repository.listTableRows('review_items', { limit: 50, offset: 0 }),
    ).resolves.toEqual([
      { id: 'review-item-1', repetitions: 5 },
      { id: 'review-item-2', repetitions: 3 },
    ]);

    await expect(
      repository.listTableRows('unknown_table', { limit: 50, offset: 0 }),
    ).rejects.toThrow('Unknown table: unknown_table');
  });

  it('agrupa variants por card ao listar estado de revisão', async () => {
    const db = new FakeDevDatabase();

    await expect(createRepository(db).listCardsWithReviewState()).resolves.toEqual([
      {
        cardId: 'card-1',
        front: 'apple',
        back: 'maçã',
        variants: [
          expect.objectContaining({
            cardVariantId: 'variant-original',
            variantType: 'original',
            repetitions: 5,
            logCount: 5,
          }),
          expect.objectContaining({
            cardVariantId: 'variant-reverse',
            variantType: 'reverse',
            repetitions: 3,
            logCount: 3,
          }),
        ],
      },
    ]);
  });

  it('reseta review_items e apaga review_logs das variants do card em transação', async () => {
    const db = new FakeDevDatabase();
    const repository = createRepository(db);
    const now = new Date('2026-06-06T12:00:00.000Z');

    await expect(repository.resetReviewStateForCardIds(['card-1'], now)).resolves.toBe(2);

    expect(db.transactionCount).toBe(1);
    expect(db.runCalls).toHaveLength(2);
    expect(db.runCalls[0]?.source).toContain('DELETE FROM review_logs');
    expect(db.runCalls[0]?.source).toContain('cv.card_id IN ($cardId0)');
    expect(db.runCalls[1]?.source).toContain('UPDATE review_items');
    expect(db.runCalls[1]?.params).toEqual(
      expect.objectContaining({
        $cardId0: 'card-1',
        $repetitions: INITIAL_REVIEW_ITEM_STATE.repetitions,
        $intervalDays: INITIAL_REVIEW_ITEM_STATE.intervalDays,
        $easeFactor: INITIAL_REVIEW_ITEM_STATE.easeFactor,
        $lapses: INITIAL_REVIEW_ITEM_STATE.lapses,
        $nextReviewAt: now.toISOString(),
        $updatedAt: now.toISOString(),
      }),
    );
  });

  it('reseta todas as variants ativas ao resetar todos os cards', async () => {
    const db = new FakeDevDatabase();

    await expect(
      createRepository(db).resetAllReviewState(new Date('2026-06-06T12:00:00.000Z')),
    ).resolves.toBe(2);

    expect(db.runCalls[0]?.source).toBe('DELETE FROM review_logs');
    expect(db.runCalls[1]?.source).toContain('WHERE c.archived_at IS NULL');
  });
});
