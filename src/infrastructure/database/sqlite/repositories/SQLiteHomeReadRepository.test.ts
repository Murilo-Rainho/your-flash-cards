import { SQLiteHomeReadRepository } from './SQLiteHomeReadRepository';
import type { SqliteDatabaseConnection } from '../types';

class FakeHomeDatabase {
  allCalls: Array<{ source: string; params: unknown[] }> = [];
  firstCalls: Array<{ source: string; params: unknown[] }> = [];

  collectionRows: unknown[] = [];
  reviewDateRows: unknown[] = [];

  async getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]> {
    this.allCalls.push({ source, params });

    if (source.includes('FROM collections collection')) {
      return this.collectionRows as T[];
    }

    if (source.includes('FROM review_logs')) {
      return this.reviewDateRows as T[];
    }

    return [];
  }

  async getFirstAsync<T>(source: string, ...params: unknown[]): Promise<T | null> {
    this.firstCalls.push({ source, params });

    if (source.includes('WHERE ri.next_review_at <= $now')) {
      return { value: 7 } as T;
    }

    if (source.includes("rl.rating IN ('again', 'hard')")) {
      return { value: 2 } as T;
    }

    if (source.includes('COUNT(rl.id) AS reviewedToday')) {
      return { reviewedToday: 4, retentionPercentage: 75 } as T;
    }

    if (source.includes('WHERE ri.repetitions >= 5')) {
      return { value: 9 } as T;
    }

    return null;
  }

  async execAsync(): Promise<void> {}

  async runAsync(): Promise<unknown> {
    return {};
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    await task();
  }

  asConnection(): SqliteDatabaseConnection {
    return this as unknown as SqliteDatabaseConnection;
  }
}

function createRepository(db: FakeHomeDatabase): SQLiteHomeReadRepository {
  return new SQLiteHomeReadRepository(async () => db.asConnection());
}

describe('SQLiteHomeReadRepository', () => {
  it('lists collection summaries from SQLite rows', async () => {
    const db = new FakeHomeDatabase();
    db.collectionRows = [
      {
        id: 'col-pt-en',
        name: 'Português -> Inglês',
        baseLanguage: 'pt',
        targetLanguage: 'en',
        description: null,
        createdAt: '2026-06-01T10:00:00.000Z',
        updatedAt: '2026-06-02T10:00:00.000Z',
        archivedAt: null,
        totalCards: 12,
        dueCards: 5,
        masteredPercentage: 67,
      },
    ];
    const now = new Date('2026-06-03T12:00:00.000Z');

    await expect(createRepository(db).listCollectionSummaries(now)).resolves.toEqual([
      {
        collection: {
          id: 'col-pt-en',
          name: 'Português -> Inglês',
          baseLanguage: 'pt',
          targetLanguage: 'en',
          description: undefined,
          createdAt: '2026-06-01T10:00:00.000Z',
          updatedAt: '2026-06-02T10:00:00.000Z',
          archivedAt: undefined,
        },
        totalCards: 12,
        dueCards: 5,
        masteredPercentage: 67,
      },
    ]);

    expect(db.allCalls[0]?.source).toContain('COUNT(DISTINCT card.id) AS totalCards');
    expect(db.allCalls[0]?.params[0]).toEqual({ $now: now.toISOString() });
  });

  it('builds the daily study summary from local review tables', async () => {
    const db = new FakeHomeDatabase();
    const now = new Date(2026, 5, 3, 12, 0, 0);
    db.reviewDateRows = [
      { reviewedAt: new Date(2026, 5, 3, 9, 0, 0).toISOString() },
      { reviewedAt: new Date(2026, 5, 2, 9, 0, 0).toISOString() },
    ];

    await expect(createRepository(db).getDailyStudySummary(now)).resolves.toEqual({
      dueCards: 7,
      difficultCards: 2,
      reviewedToday: 4,
      retentionPercentage: 75,
      streakDays: 2,
      masteredCards: 9,
    });

    expect(db.firstCalls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          params: [{ $now: now.toISOString() }],
        }),
        expect.objectContaining({
          params: [
            { $startOfDay: new Date(2026, 5, 3, 0, 0, 0).toISOString(), $now: now.toISOString() },
          ],
        }),
      ]),
    );
  });
});
