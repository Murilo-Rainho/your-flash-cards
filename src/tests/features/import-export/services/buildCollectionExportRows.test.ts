import { describe, expect, it } from '@jest/globals';

import { CARD_TYPES } from '@/constants/cardTypes';
import type { Card } from '@/domain/entities/Card';
import { MEDIA_SIDES, MEDIA_TYPES, type Media } from '@/domain/entities/Media';
import type { Tag } from '@/domain/entities/Tag';
import type { ExportCardRecord } from '@/domain/repositories/CardExportReadRepository';
import { buildCollectionExportRows } from '@/features/import-export/services/buildCollectionExportRows';

const timestamp = '2024-01-01T00:00:00.000Z';

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'card-1',
    deckId: 'deck-1',
    type: CARD_TYPES.VOCABULARY,
    front: 'house',
    back: 'casa',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

function makeMedia(overrides: Partial<Media>): Media {
  return {
    id: 'media-1',
    cardId: 'card-1',
    side: MEDIA_SIDES.FRONT,
    type: MEDIA_TYPES.IMAGE,
    uri: 'file://x',
    mimeType: 'image/png',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

function makeTag(name: string): Tag {
  return {
    id: `tag-${name}`,
    collectionId: 'col-1',
    name,
    normalizedName: name,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

describe('buildCollectionExportRows', () => {
  it('maps deck name, card fields, tags and notes', () => {
    const records: ExportCardRecord[] = [
      {
        deckName: 'Deck A',
        card: makeCard({ notes: 'remember this' }),
        tags: [makeTag('home'), makeTag('basic')],
        media: [],
      },
    ];

    expect(buildCollectionExportRows(records)).toEqual([
      {
        deck: 'Deck A',
        type: CARD_TYPES.VOCABULARY,
        front: 'house',
        back: 'casa',
        tags: ['home', 'basic'],
        notes: 'remember this',
      },
    ]);
  });

  it('writes image paths and a tts marker for TTS audio', () => {
    const records: ExportCardRecord[] = [
      {
        deckName: 'Deck A',
        card: makeCard(),
        tags: [],
        media: [
          makeMedia({ side: MEDIA_SIDES.FRONT, type: MEDIA_TYPES.IMAGE, uri: 'file://img.png' }),
          makeMedia({
            id: 'm-tts',
            side: MEDIA_SIDES.FRONT,
            type: MEDIA_TYPES.TTS,
            uri: 'tts://local/en-US/front',
            mimeType: 'application/x-tts',
          }),
        ],
      },
    ];

    const [row] = buildCollectionExportRows(records);

    expect(row?.imageFront).toBe('file://img.png');
    expect(row?.audioFront).toBe('tts:en-US');
  });

  it('writes the file uri for audio/recording media on the back', () => {
    const records: ExportCardRecord[] = [
      {
        deckName: 'Deck A',
        card: makeCard({ type: CARD_TYPES.PRONUNCIATION }),
        tags: [],
        media: [
          makeMedia({
            id: 'm-audio',
            side: MEDIA_SIDES.BACK,
            type: MEDIA_TYPES.AUDIO,
            uri: 'file://audio.mp3',
            mimeType: 'audio/mpeg',
          }),
        ],
      },
    ];

    const [row] = buildCollectionExportRows(records);

    expect(row?.audioBack).toBe('file://audio.mp3');
    expect(row?.audioFront).toBeUndefined();
  });
});
