import { describe, expect, it } from '@jest/globals';

import { CARD_TYPES } from '@/constants/cardTypes';
import { parseCsv } from '@/domain/csv/csv';
import { CARDS_CSV_HEADER, serializeCardsCsv, ttsCsvCell } from '@/domain/exporters/cardsCsv';
import type { ExportCardRow } from '@/domain/exporters/DeckExporter';

describe('ttsCsvCell', () => {
  it('prefixes the language with the tts marker', () => {
    expect(ttsCsvCell('en-US')).toBe('tts:en-US');
  });
});

describe('serializeCardsCsv', () => {
  const row: ExportCardRow = {
    deck: 'Básico',
    type: CARD_TYPES.VOCABULARY,
    front: 'house',
    back: 'casa',
    tags: ['home', 'basic'],
    notes: 'a note',
    imageFront: 'media/images/house.png',
    audioFront: ttsCsvCell('en-US'),
  };

  it('writes the header first', () => {
    const csv = serializeCardsCsv([]);

    expect(csv).toBe(CARDS_CSV_HEADER.join(','));
  });

  it('serializes a row with tags joined, notes and media cells', () => {
    const rows = parseCsv(serializeCardsCsv([row]));

    expect(rows[0]).toEqual([...CARDS_CSV_HEADER]);
    expect(rows[1]).toEqual([
      'Básico',
      'vocabulary',
      'house',
      'casa',
      'home,basic',
      'a note',
      'media/images/house.png',
      'tts:en-US',
      '',
      '',
    ]);
  });

  it('emits empty cells for missing optional fields', () => {
    const rows = parseCsv(
      serializeCardsCsv([
        {
          deck: 'D',
          type: CARD_TYPES.VOCABULARY,
          front: 'a',
          back: 'b',
          tags: [],
        },
      ]),
    );

    expect(rows[1]).toEqual(['D', 'vocabulary', 'a', 'b', '', '', '', '', '', '']);
  });
});
