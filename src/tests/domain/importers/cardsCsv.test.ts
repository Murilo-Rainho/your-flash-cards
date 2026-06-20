import { describe, expect, it } from '@jest/globals';

import { CARD_TYPES } from '@/constants/cardTypes';
import { IMPORT_SKIP_REASONS, parseCardsCsv } from '@/domain/importers/cardsCsv';

const HEADER = 'deck,type,front,back,tags,notes,image_front,audio_front,image_back,audio_back';

describe('parseCardsCsv', () => {
  it('returns nothing for empty content', () => {
    expect(parseCardsCsv('')).toEqual({ cards: [], skipped: [] });
  });

  it('parses a valid row with tags, notes and tts marker', () => {
    const csv = `${HEADER}\nBásico,vocabulary,house,casa,"home,basic",a note,,tts:en-US,,`;

    const result = parseCardsCsv(csv);

    expect(result.skipped).toEqual([]);
    expect(result.cards).toEqual([
      {
        rowNumber: 2,
        deck: 'Básico',
        type: CARD_TYPES.VOCABULARY,
        front: 'house',
        back: 'casa',
        tags: ['home', 'basic'],
        notes: 'a note',
        ttsFront: 'en-US',
        fileMediaRefs: [],
      },
    ]);
  });

  it('collects file media references and skips them from tts', () => {
    const csv = `${HEADER}\nD,vocabulary,a,b,,,media/images/x.png,media/audios/y.mp3,,`;

    const [card] = parseCardsCsv(csv).cards;

    expect(card?.fileMediaRefs).toEqual(['media/images/x.png', 'media/audios/y.mp3']);
    expect(card?.ttsFront).toBeUndefined();
  });

  it('skips rows with an invalid type (best-effort)', () => {
    const csv = `${HEADER}\nD,not-a-type,a,b,,,,,,\nD,vocabulary,c,d,,,,,,`;

    const result = parseCardsCsv(csv);

    expect(result.cards).toHaveLength(1);
    expect(result.skipped).toEqual([
      expect.objectContaining({ rowNumber: 2, reason: IMPORT_SKIP_REASONS.INVALID_TYPE }),
    ]);
  });

  it('skips rows missing both front and back', () => {
    const csv = `${HEADER}\nD,vocabulary,,,,,,,,`;

    const result = parseCardsCsv(csv);

    expect(result.cards).toEqual([]);
    expect(result.skipped).toEqual([
      expect.objectContaining({ rowNumber: 2, reason: IMPORT_SKIP_REASONS.MISSING_FIELDS }),
    ]);
  });

  it('ignores fully blank lines', () => {
    const csv = `${HEADER}\n\nD,vocabulary,a,b,,,,,,\n`;

    const result = parseCardsCsv(csv);

    expect(result.cards).toHaveLength(1);
    expect(result.skipped).toEqual([]);
  });

  it('resolves columns by header name regardless of order (§16 short form)', () => {
    const csv = `front,back,type,tags\nhouse,casa,vocabulary,"home,basic"`;

    const [card] = parseCardsCsv(csv).cards;

    expect(card).toMatchObject({
      deck: '',
      type: CARD_TYPES.VOCABULARY,
      front: 'house',
      back: 'casa',
      tags: ['home', 'basic'],
    });
  });

  it('records a tts back voice with an empty language', () => {
    const csv = `${HEADER}\nD,pronunciation,a,b,,,,,,tts:`;

    const [card] = parseCardsCsv(csv).cards;

    expect(card?.ttsBack).toBe('');
  });
});
