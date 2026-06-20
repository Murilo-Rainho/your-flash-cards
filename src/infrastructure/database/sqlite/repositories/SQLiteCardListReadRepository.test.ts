import { describe, expect, it } from '@jest/globals';

import { CARD_TYPES } from '@/constants/cardTypes';
import { MEDIA_TYPES } from '@/domain/entities/Media';
import type { CardListPageParams } from '@/domain/repositories/CardListReadRepository';

import type { SqliteDatabaseConnection } from '../types';
import { SQLiteCardListReadRepository } from './SQLiteCardListReadRepository';

type CardListRow = {
  id: string;
  deckId: string;
  type: string;
  front: string;
  back: string;
  clozeData: null;
  notes: null;
  createdAt: string;
  updatedAt: string;
  archivedAt: null;
  hasAudio: number;
  hasImage: number;
};

class FakeCardListDatabase {
  getAllCalls: Array<{ source: string; params: Record<string, unknown> }> = [];

  constructor(private readonly rows: CardListRow[]) {}

  async execAsync(): Promise<void> {}
  async runAsync(): Promise<unknown> {
    return {};
  }
  async getFirstAsync<T>(): Promise<T | null> {
    return null;
  }
  async getAllAsync<T>(source: string, params: Record<string, unknown>): Promise<T[]> {
    this.getAllCalls.push({ source, params });
    return this.rows as T[];
  }
  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    await task();
  }
  asConnection(): SqliteDatabaseConnection {
    return this as unknown as SqliteDatabaseConnection;
  }
}

function row(index: number, media: { audio?: boolean; image?: boolean } = {}): CardListRow {
  const suffix = String(index).padStart(3, '0');
  return {
    id: `card-${suffix}`,
    deckId: 'deck-1',
    type: CARD_TYPES.VOCABULARY,
    front: index === 0 ? 'Café' : `Front ${index}`,
    back: `Back ${index}`,
    clozeData: null,
    notes: null,
    createdAt: `2026-06-18T12:${suffix.slice(-2)}:00.000Z`,
    updatedAt: `2026-06-19T12:${suffix.slice(-2)}:00.000Z`,
    archivedAt: null,
    hasAudio: media.audio ? 1 : 0,
    hasImage: media.image ? 1 : 0,
  };
}

function params(overrides: Partial<CardListPageParams> = {}): CardListPageParams {
  return {
    deckId: 'deck-1',
    query: '',
    mediaFilters: { audio: false, image: false },
    limit: 30,
    ...overrides,
  };
}

function createRepository(db: FakeCardListDatabase): SQLiteCardListReadRepository {
  return new SQLiteCardListReadRepository(async () => db.asConnection());
}

describe('SQLiteCardListReadRepository', () => {
  it('returns 30 items and derives a stable cursor from the extra row', async () => {
    const db = new FakeCardListDatabase(Array.from({ length: 31 }, (_, index) => row(index)));

    const page = await createRepository(db).listPage(params());

    expect(page.items).toHaveLength(30);
    expect(page.items[0]).toEqual({
      card: expect.objectContaining({ id: 'card-000', front: 'Café' }),
      hasAudio: false,
      hasImage: false,
    });
    expect(page.nextCursor).toEqual({
      updatedAt: row(29).updatedAt,
      createdAt: row(29).createdAt,
      id: 'card-029',
    });
    expect(db.getAllCalls[0]?.params.$limit).toBe(31);
    expect(db.getAllCalls[0]?.source).toContain('ORDER BY updatedAt DESC, createdAt DESC, id DESC');
  });

  it('binds the cursor and stops pagination when no extra row exists', async () => {
    const db = new FakeCardListDatabase([row(30)]);
    const cursor = {
      updatedAt: row(29).updatedAt,
      createdAt: row(29).createdAt,
      id: 'card-029',
    };

    const page = await createRepository(db).listPage(params({ cursor }));

    expect(page.nextCursor).toBeUndefined();
    expect(db.getAllCalls[0]?.params).toEqual(
      expect.objectContaining({
        $cursorUpdatedAt: cursor.updatedAt,
        $cursorCreatedAt: cursor.createdAt,
        $cursorId: cursor.id,
      }),
    );
  });

  it('normalizes search and escapes LIKE wildcard characters before the LIMIT', async () => {
    const db = new FakeCardListDatabase([]);
    const repository = createRepository(db);

    await repository.listPage(params({ query: ' CAFÉ ' }));
    expect(db.getAllCalls[0]?.params.$searchPattern).toBe('%cafe%');

    await repository.listPage(params({ query: String.raw`50%_\off` }));
    expect(db.getAllCalls[1]?.params.$searchPattern).toBe(String.raw`%50\%\_\\off%`);
    expect(db.getAllCalls[1]?.source.indexOf('front_search LIKE')).toBeLessThan(
      db.getAllCalls[1]?.source.indexOf('LIMIT $limit') ?? -1,
    );
  });

  it('applies text with inclusive audio and image filters inside SQLite', async () => {
    const db = new FakeCardListDatabase([row(1, { audio: true, image: true })]);

    const page = await createRepository(db).listPage(
      params({
        query: 'front',
        mediaFilters: { audio: true, image: true },
      }),
    );

    expect(page.items[0]).toMatchObject({ hasAudio: true, hasImage: true });
    expect(db.getAllCalls[0]?.params).toEqual(
      expect.objectContaining({
        $filterAudio: 1,
        $filterImage: 1,
        $audioType: MEDIA_TYPES.AUDIO,
        $recordingType: MEDIA_TYPES.RECORDING,
        $ttsType: MEDIA_TYPES.TTS,
        $imageType: MEDIA_TYPES.IMAGE,
      }),
    );
    expect(db.getAllCalls[0]?.source).toContain('OR ($filterAudio = 1 AND hasAudio = 1)');
    expect(db.getAllCalls[0]?.source).toContain('OR ($filterImage = 1 AND hasImage = 1)');
    expect(db.getAllCalls[0]?.source).toContain('card.archived_at IS NULL');
    expect(db.getAllCalls[0]?.source).toContain('card.deck_id = $deckId');
  });
});
