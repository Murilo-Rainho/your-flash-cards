import { describe, expect, it } from '@jest/globals';

import { REVIEW_RATINGS } from '@/constants/reviewRatings';

import { SQLiteReviewRepository } from './SQLiteReviewRepository';
import type { SqliteDatabaseConnection } from '../types';

class FakeReviewDatabase {
  allCalls: Array<{ source: string; params: unknown }> = [];
  runCalls: Array<{ source: string; params: unknown }> = [];
  transactionCount = 0;

  dueRows: unknown[] = [];
  mediaRows: unknown[] = [];

  async getAllAsync<T>(source: string, params?: unknown): Promise<T[]> {
    this.allCalls.push({ source, params });

    if (source.includes('FROM review_items ri')) {
      return this.dueRows as T[];
    }

    if (source.includes('FROM media')) {
      return this.mediaRows as T[];
    }

    return [];
  }

  async getFirstAsync<T>(): Promise<T | null> {
    return null;
  }

  async execAsync(): Promise<void> {}

  async runAsync(source: string, params?: unknown): Promise<unknown> {
    this.runCalls.push({ source, params });
    return {};
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    this.transactionCount += 1;
    await task();
  }

  asConnection(): SqliteDatabaseConnection {
    return this as unknown as SqliteDatabaseConnection;
  }
}

function createRepository(db: FakeReviewDatabase): SQLiteReviewRepository {
  return new SQLiteReviewRepository(async () => db.asConnection());
}

function makeDueRow(overrides: Record<string, unknown> = {}) {
  return {
    reviewItemId: 'review-item-1',
    cardVariantId: 'variant-1',
    schedulerType: 'sm2',
    schedulerVersion: 'v1',
    repetitions: 2,
    intervalDays: 6,
    easeFactor: 2.5,
    nextReviewAt: '2026-06-01T10:00:00.000Z',
    lastReviewedAt: '2026-05-26T10:00:00.000Z',
    lapses: 0,
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-26T10:00:00.000Z',
    variantType: 'original',
    cardId: 'card-1',
    cardType: 'vocabulary',
    front: 'apple',
    back: 'maçã',
    notes: null,
    ...overrides,
  };
}

describe('SQLiteReviewRepository', () => {
  describe('listDueReviewCards', () => {
    it('lists due cards ordered with LIMIT and aggregates media per card', async () => {
      const db = new FakeReviewDatabase();
      db.dueRows = [
        makeDueRow(),
        makeDueRow({
          reviewItemId: 'review-item-2',
          cardVariantId: 'variant-2',
          cardId: 'card-2',
          cardType: 'listening',
          front: '',
          back: "I'm tired",
          nextReviewAt: '2026-06-02T10:00:00.000Z',
        }),
      ];
      db.mediaRows = [
        {
          id: 'media-1',
          cardId: 'card-2',
          cardVariantId: null,
          side: 'front',
          type: 'audio',
          uri: 'file://a.m4a',
          mimeType: 'audio/m4a',
          createdAt: '2026-05-01T10:00:00.000Z',
          updatedAt: '2026-05-01T10:00:00.000Z',
        },
      ];
      const now = new Date('2026-06-05T12:00:00.000Z');

      const result = await createRepository(db).listDueReviewCards({ now, limit: 20 });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        reviewItem: {
          id: 'review-item-1',
          cardVariantId: 'variant-1',
          schedulerType: 'sm2',
          schedulerVersion: 'v1',
          repetitions: 2,
          intervalDays: 6,
          easeFactor: 2.5,
          nextReviewAt: '2026-06-01T10:00:00.000Z',
          lastReviewedAt: '2026-05-26T10:00:00.000Z',
          lapses: 0,
          createdAt: '2026-05-01T10:00:00.000Z',
          updatedAt: '2026-05-26T10:00:00.000Z',
        },
        cardId: 'card-1',
        cardType: 'vocabulary',
        front: 'apple',
        back: 'maçã',
        notes: undefined,
        variantType: 'original',
        media: [],
      });
      expect(result[1].media).toEqual([
        {
          id: 'media-1',
          cardId: 'card-2',
          cardVariantId: undefined,
          side: 'front',
          type: 'audio',
          uri: 'file://a.m4a',
          mimeType: 'audio/m4a',
          createdAt: '2026-05-01T10:00:00.000Z',
          updatedAt: '2026-05-01T10:00:00.000Z',
        },
      ]);

      const dueCall = db.allCalls.find((call) => call.source.includes('FROM review_items ri'));
      expect(dueCall?.source).toContain('WHERE ri.next_review_at <= $now');
      expect(dueCall?.source).toContain('ORDER BY ri.next_review_at ASC');
      expect(dueCall?.source).toContain('LIMIT $limit');
      expect(dueCall?.params).toEqual({ $now: now.toISOString(), $limit: 20 });
    });

    it('applies optional collection and deck filters in query and params', async () => {
      const db = new FakeReviewDatabase();
      db.dueRows = [makeDueRow()];
      const now = new Date('2026-06-05T12:00:00.000Z');

      await createRepository(db).listDueReviewCards({
        now,
        limit: 10,
        collectionId: 'col-1',
        deckId: 'deck-1',
      });

      const dueCall = db.allCalls.find((call) => call.source.includes('FROM review_items ri'));
      expect(dueCall?.source).toContain('AND collection.id = $collectionId');
      expect(dueCall?.source).toContain('AND deck.id = $deckId');
      expect(dueCall?.params).toEqual({
        $now: now.toISOString(),
        $limit: 10,
        $collectionId: 'col-1',
        $deckId: 'deck-1',
      });
    });

    it('returns empty list without querying media when there are no due cards', async () => {
      const db = new FakeReviewDatabase();
      db.dueRows = [];

      const result = await createRepository(db).listDueReviewCards({
        now: new Date('2026-06-05T12:00:00.000Z'),
        limit: 20,
      });

      expect(result).toEqual([]);
      expect(db.allCalls.some((call) => call.source.includes('FROM media'))).toBe(false);
    });
  });

  describe('applyReview', () => {
    it('updates review_item and writes review_log in the same transaction', async () => {
      const db = new FakeReviewDatabase();
      const reviewedAt = new Date('2026-06-05T12:00:00.000Z');

      const log = await createRepository(db).applyReview({
        reviewItemId: 'review-item-1',
        rating: REVIEW_RATINGS.GOOD,
        reviewedAt,
        timeSpentMs: 4200,
        previousIntervalDays: 6,
        previousEaseFactor: 2.5,
        result: {
          repetitions: 3,
          intervalDays: 15,
          easeFactor: 2.5,
          lapses: 0,
          nextReviewAt: '2026-06-20T12:00:00.000Z',
        },
      });

      expect(db.transactionCount).toBe(1);
      expect(db.runCalls).toHaveLength(2);
      expect(db.runCalls[0].source).toContain('UPDATE review_items');
      expect(db.runCalls[1].source).toContain('INSERT INTO review_logs');

      expect(db.runCalls[0].params).toMatchObject({
        $repetitions: 3,
        $intervalDays: 15,
        $easeFactor: 2.5,
        $lapses: 0,
        $nextReviewAt: '2026-06-20T12:00:00.000Z',
        $reviewedAt: reviewedAt.toISOString(),
        $reviewItemId: 'review-item-1',
      });
      expect(db.runCalls[1].params).toMatchObject({
        $reviewItemId: 'review-item-1',
        $sessionId: null,
        $rating: 'good',
        $reviewedAt: reviewedAt.toISOString(),
        $timeSpentMs: 4200,
        $previousIntervalDays: 6,
        $nextIntervalDays: 15,
        $previousEaseFactor: 2.5,
        $nextEaseFactor: 2.5,
      });

      expect(log).toMatchObject({
        reviewItemId: 'review-item-1',
        rating: 'good',
        reviewedAt: reviewedAt.toISOString(),
        timeSpentMs: 4200,
        previousIntervalDays: 6,
        nextIntervalDays: 15,
        previousEaseFactor: 2.5,
        nextEaseFactor: 2.5,
      });
      expect(log.id).toMatch(/^review-log_/);
    });
  });
});
