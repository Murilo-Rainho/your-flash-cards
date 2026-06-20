import { describe, expect, it } from '@jest/globals';

import { CARD_TYPES } from '@/constants/cardTypes';
import type { Collection } from '@/domain/entities/Collection';
import {
  EXPORT_FORMATS,
  type DeckExporter,
  type ExportInput,
  type ExportResult,
} from '@/domain/exporters/DeckExporter';
import type { CollectionRepository } from '@/domain/repositories/CollectionRepository';
import type {
  CardExportReadRepository,
  ExportCardRecord,
} from '@/domain/repositories/CardExportReadRepository';
import {
  exportCollection,
  isExportCollectionError,
  type ExportCollectionError,
} from '@/features/import-export/services/exportCollection';

const timestamp = '2024-01-01T00:00:00.000Z';

const collection: Collection = {
  id: 'col-1',
  name: 'Coleção',
  baseLanguage: 'pt',
  targetLanguage: 'en',
  createdAt: timestamp,
  updatedAt: timestamp,
};

class FakeCollectionRepository implements CollectionRepository {
  constructor(private readonly collections: Collection[]) {}
  async create(c: Collection) {
    return c;
  }
  async update(c: Collection) {
    return c;
  }
  async listActive() {
    return this.collections;
  }
  async findById(id: string) {
    return this.collections.find((c) => c.id === id) ?? null;
  }
}

class FakeExportReadRepository implements CardExportReadRepository {
  constructor(private readonly records: ExportCardRecord[]) {}
  async listCardsByCollection() {
    return this.records;
  }
}

class FakeExporter implements DeckExporter {
  readonly target = EXPORT_FORMATS.CSV;
  lastInput: ExportInput | null = null;

  canExport(input: ExportInput) {
    return input.rows.length > 0;
  }

  export(input: ExportInput): Promise<ExportResult> {
    this.lastInput = input;
    return Promise.resolve({
      format: EXPORT_FORMATS.CSV,
      fileName: 'out.csv',
      mimeType: 'text/csv',
      content: 'csv',
      count: input.rows.length,
    });
  }
}

function makeRecord(): ExportCardRecord {
  return {
    deckName: 'Deck',
    card: {
      id: 'card-1',
      deckId: 'deck-1',
      type: CARD_TYPES.VOCABULARY,
      front: 'house',
      back: 'casa',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    tags: [],
    media: [],
  };
}

describe('exportCollection', () => {
  it('reads cards, builds rows and delegates to the exporter', async () => {
    const exporter = new FakeExporter();

    const result = await exportCollection(
      { collectionId: 'col-1' },
      {
        collectionRepository: new FakeCollectionRepository([collection]),
        exportReadRepository: new FakeExportReadRepository([makeRecord()]),
        exporter,
      },
    );

    expect(result.count).toBe(1);
    expect(exporter.lastInput?.collection).toEqual(collection);
    expect(exporter.lastInput?.rows[0]?.front).toBe('house');
  });

  it('throws collection-not-found when the collection is missing', async () => {
    await expect(
      exportCollection(
        { collectionId: 'missing' },
        {
          collectionRepository: new FakeCollectionRepository([]),
          exportReadRepository: new FakeExportReadRepository([]),
          exporter: new FakeExporter(),
        },
      ),
    ).rejects.toMatchObject({ code: 'collection-not-found' });
  });

  it('throws empty when there is nothing to export', async () => {
    try {
      await exportCollection(
        { collectionId: 'col-1' },
        {
          collectionRepository: new FakeCollectionRepository([collection]),
          exportReadRepository: new FakeExportReadRepository([]),
          exporter: new FakeExporter(),
        },
      );
      throw new Error('should have thrown');
    } catch (error) {
      expect(isExportCollectionError(error)).toBe(true);
      expect((error as ExportCollectionError).code).toBe('empty');
    }
  });
});
