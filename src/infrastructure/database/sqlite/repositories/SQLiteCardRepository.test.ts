import { describe, expect, it } from '@jest/globals';

import { CARD_TYPES } from '@/constants/cardTypes';
import { MEDIA_SIDES, MEDIA_TYPES } from '@/domain/entities/Media';
import type { CardAggregate } from '@/domain/repositories/CardRepository';

import { SQLiteCardRepository } from './SQLiteCardRepository';
import type { SqliteDatabaseConnection } from '../types';

class FakeCardDatabase {
  runCalls: Array<{ source: string; params: unknown[] }> = [];
  getFirstCalls: Array<{ source: string; params: unknown[] }> = [];
  getAllCalls: Array<{ source: string; params: unknown[] }> = [];
  transactionCount = 0;

  constructor(private readonly allRows: unknown[] = []) {}

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
    return { id: 'tag-existing' } as T;
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    this.transactionCount += 1;
    await task();
  }

  asConnection(): SqliteDatabaseConnection {
    return this as unknown as SqliteDatabaseConnection;
  }
}

function createRepository(db: FakeCardDatabase): SQLiteCardRepository {
  return new SQLiteCardRepository(async () => db.asConnection());
}

const aggregate: CardAggregate = {
  card: {
    id: 'card-1',
    deckId: 'deck-1',
    type: CARD_TYPES.VOCABULARY,
    front: 'house',
    back: 'casa',
    notes: 'basic',
    createdAt: '2026-06-03T12:00:00.000Z',
    updatedAt: '2026-06-03T12:00:00.000Z',
  },
  variants: [
    {
      id: 'variant-original',
      cardId: 'card-1',
      variantType: 'original',
      isGenerated: false,
      createdAt: '2026-06-03T12:00:00.000Z',
      updatedAt: '2026-06-03T12:00:00.000Z',
    },
    {
      id: 'variant-reverse',
      cardId: 'card-1',
      variantType: 'reverse',
      isGenerated: true,
      createdAt: '2026-06-03T12:00:00.000Z',
      updatedAt: '2026-06-03T12:00:00.000Z',
    },
  ],
  media: [
    {
      id: 'media-1',
      cardId: 'card-1',
      side: MEDIA_SIDES.FRONT,
      type: MEDIA_TYPES.IMAGE,
      uri: 'file://cards/card-1/front-image-media-1.jpg',
      mimeType: 'image/jpeg',
      createdAt: '2026-06-03T12:00:00.000Z',
      updatedAt: '2026-06-03T12:00:00.000Z',
    },
  ],
  tags: [
    {
      id: 'tag-travel',
      collectionId: 'collection-pt-en',
      name: 'travel',
      normalizedName: 'travel',
      createdAt: '2026-06-03T12:00:00.000Z',
      updatedAt: '2026-06-03T12:00:00.000Z',
    },
  ],
  reviewItems: [
    {
      id: 'review-original',
      cardVariantId: 'variant-original',
      schedulerType: 'sm2',
      schedulerVersion: 'v1',
      repetitions: 0,
      intervalDays: 0,
      easeFactor: 2.5,
      nextReviewAt: '2026-06-03T12:00:00.000Z',
      lapses: 0,
      createdAt: '2026-06-03T12:00:00.000Z',
      updatedAt: '2026-06-03T12:00:00.000Z',
    },
    {
      id: 'review-reverse',
      cardVariantId: 'variant-reverse',
      schedulerType: 'sm2',
      schedulerVersion: 'v1',
      repetitions: 0,
      intervalDays: 0,
      easeFactor: 2.5,
      nextReviewAt: '2026-06-03T12:00:00.000Z',
      lapses: 0,
      createdAt: '2026-06-03T12:00:00.000Z',
      updatedAt: '2026-06-03T12:00:00.000Z',
    },
  ],
};

describe('SQLiteCardRepository', () => {
  it('persists the card aggregate and parent timestamps inside one transaction', async () => {
    const db = new FakeCardDatabase();

    await expect(createRepository(db).createAggregate(aggregate)).resolves.toBe(aggregate);

    expect(db.transactionCount).toBe(1);
    expect(db.runCalls.map((call) => call.source)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('INSERT INTO cards'),
        expect.stringContaining('INSERT INTO card_variants'),
        expect.stringContaining('INSERT INTO media'),
        expect.stringContaining('INSERT OR IGNORE INTO tags'),
        expect.stringContaining('INSERT OR IGNORE INTO card_tags'),
        expect.stringContaining('INSERT INTO review_items'),
        expect.stringContaining('UPDATE decks'),
        expect.stringContaining('UPDATE collections'),
      ]),
    );
    expect(db.runCalls[0]?.params[0]).toEqual({
      $id: 'card-1',
      $deckId: 'deck-1',
      $type: CARD_TYPES.VOCABULARY,
      $front: 'house',
      $back: 'casa',
      $frontSearch: 'house',
      $backSearch: 'casa',
      $clozeData: null,
      $notes: 'basic',
      $createdAt: '2026-06-03T12:00:00.000Z',
      $updatedAt: '2026-06-03T12:00:00.000Z',
      $archivedAt: null,
    });
    expect(db.getFirstCalls[0]?.source).toContain('SELECT id');
    expect(
      db.runCalls.some((call) => call.source.includes('INSERT OR IGNORE INTO card_tags')),
    ).toBe(true);
  });

  it('updates normalized search projections with the card source fields', async () => {
    const db = new FakeCardDatabase();
    const updatedAggregate: CardAggregate = {
      ...aggregate,
      card: {
        ...aggregate.card,
        front: '  CAFÉ  ',
        back: 'Ação RÁPIDA',
        updatedAt: '2026-06-04T12:00:00.000Z',
      },
    };

    await createRepository(db).updateAggregate(updatedAggregate);

    const cardUpdate = db.runCalls.find((call) => call.source.includes('UPDATE cards'));
    expect(cardUpdate?.source).toContain('front_search = $frontSearch');
    expect(cardUpdate?.source).toContain('back_search = $backSearch');
    expect(cardUpdate?.params[0]).toEqual(
      expect.objectContaining({
        $front: '  CAFÉ  ',
        $back: 'Ação RÁPIDA',
        $frontSearch: 'cafe',
        $backSearch: 'acao rapida',
      }),
    );
  });
});
