import { describe, expect, it } from '@jest/globals';

import { CARD_TYPES } from '@/constants/cardTypes';
import type { Collection } from '@/domain/entities/Collection';
import type { ExportCardRow, ExportInput } from '@/domain/exporters/DeckExporter';
import { CsvDeckExporter, getCsvDeckExporter } from '@/infrastructure/exporters/CsvDeckExporter';

const collection: Collection = {
  id: 'col-1',
  name: 'Inglês Básico!',
  baseLanguage: 'pt',
  targetLanguage: 'en',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const row: ExportCardRow = {
  deck: 'Deck',
  type: CARD_TYPES.VOCABULARY,
  front: 'house',
  back: 'casa',
  tags: [],
};

describe('CsvDeckExporter', () => {
  it('cannot export when there are no rows', () => {
    const exporter = new CsvDeckExporter();

    expect(exporter.canExport({ collection, rows: [] })).toBe(false);
    expect(exporter.canExport({ collection, rows: [row] })).toBe(true);
  });

  it('produces a csv file with a slugified name and card count', async () => {
    const exporter = new CsvDeckExporter();
    const input: ExportInput = { collection, rows: [row] };

    const result = await exporter.export(input);

    expect(result.format).toBe('csv');
    expect(result.mimeType).toBe('text/csv');
    expect(result.fileName).toBe('ingles-basico.csv');
    expect(result.count).toBe(1);
    expect(result.content.split('\n')[0]).toBe(
      'deck,type,front,back,tags,notes,image_front,audio_front,image_back,audio_back',
    );
  });

  it('falls back to a default file name for nameless collections', async () => {
    const exporter = new CsvDeckExporter();

    const result = await exporter.export({
      collection: { ...collection, name: '!!!' },
      rows: [row],
    });

    expect(result.fileName).toBe('colecao.csv');
  });

  it('returns a shared singleton instance', () => {
    expect(getCsvDeckExporter()).toBe(getCsvDeckExporter());
  });
});
