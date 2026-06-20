import { describe, expect, it } from '@jest/globals';

import { CARD_TYPES } from '@/constants/cardTypes';
import type { Collection } from '@/domain/entities/Collection';
import type { Deck } from '@/domain/entities/Deck';
import { MEDIA_TYPES } from '@/domain/entities/Media';
import type { ParsedImportCard } from '@/domain/importers/DeckImporter';
import type { CardAggregate, CardRepository } from '@/domain/repositories/CardRepository';
import type { CollectionRepository } from '@/domain/repositories/CollectionRepository';
import type { DeckRepository } from '@/domain/repositories/DeckRepository';
import type {
  LocalMediaStorage,
  PersistLocalMediaInput,
} from '@/domain/services/LocalMediaStorage';
import {
  IMPORT_SAVE_REASONS,
  ImportCollectionNotFoundError,
  importCsvCards,
} from '@/features/import-export/services/importCsvCards';

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

class FakeDeckRepository implements DeckRepository {
  created: Deck[] = [];
  constructor(private readonly decks: Deck[]) {}
  async create(deck: Deck) {
    this.created.push(deck);
    this.decks.push(deck);
    return deck;
  }
  async update(deck: Deck) {
    return deck;
  }
  async listActiveByCollection(collectionId: string) {
    return this.decks.filter((deck) => deck.collectionId === collectionId && !deck.archivedAt);
  }
  async findById(id: string) {
    return this.decks.find((deck) => deck.id === id && !deck.archivedAt) ?? null;
  }
}

class FakeCardRepository implements CardRepository {
  aggregates: CardAggregate[] = [];
  async createAggregate(aggregate: CardAggregate) {
    this.aggregates.push(aggregate);
    return aggregate;
  }
  async findAggregateById(id: string) {
    return this.aggregates.find((aggregate) => aggregate.card.id === id) ?? null;
  }
  async updateAggregate(aggregate: CardAggregate) {
    return aggregate;
  }
  async archiveCard() {
    return undefined;
  }
}

class FakeMediaStorage implements LocalMediaStorage {
  async copyToCard(input: PersistLocalMediaInput) {
    return { uri: `file://${input.cardId}`, mimeType: input.mimeType };
  }
  async deleteMany() {
    return undefined;
  }
}

function makeDeck(name: string, id: string): Deck {
  return {
    id,
    collectionId: 'col-1',
    name,
    autoGenerateReverseCards: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function makeParsedCard(overrides: Partial<ParsedImportCard> = {}): ParsedImportCard {
  return {
    rowNumber: 2,
    deck: 'Deck A',
    type: CARD_TYPES.VOCABULARY,
    front: 'house',
    back: 'casa',
    tags: [],
    fileMediaRefs: [],
    ...overrides,
  };
}

function makeOptions() {
  return {
    collectionRepository: new FakeCollectionRepository([collection]),
    deckRepository: new FakeDeckRepository([makeDeck('Deck A', 'deck-a')]),
    cardRepository: new FakeCardRepository(),
    mediaStorage: new FakeMediaStorage(),
    defaultDeckName: 'Importados',
  };
}

describe('importCsvCards', () => {
  it('imports into an existing deck matched by name', async () => {
    const options = makeOptions();

    const result = await importCsvCards(
      { collectionId: 'col-1', cards: [makeParsedCard()] },
      options,
    );

    expect(result.imported).toBe(1);
    expect(result.skipped).toEqual([]);
    expect(options.deckRepository.created).toHaveLength(0);
    expect(options.cardRepository.aggregates[0]?.card.deckId).toBe('deck-a');
  });

  it('creates a new deck when the name is unknown', async () => {
    const options = makeOptions();

    await importCsvCards(
      { collectionId: 'col-1', cards: [makeParsedCard({ deck: 'Nova' })] },
      options,
    );

    expect(options.deckRepository.created).toHaveLength(1);
    expect(options.deckRepository.created[0]?.name).toBe('Nova');
  });

  it('falls back to the default deck name when the row has no deck', async () => {
    const options = makeOptions();

    await importCsvCards({ collectionId: 'col-1', cards: [makeParsedCard({ deck: '' })] }, options);

    expect(options.deckRepository.created[0]?.name).toBe('Importados');
  });

  it('recreates TTS media and merges common tags', async () => {
    const options = makeOptions();

    await importCsvCards(
      {
        collectionId: 'col-1',
        cards: [makeParsedCard({ tags: ['home'], ttsFront: 'en-US' })],
        commonTags: ['imported'],
      },
      options,
    );

    const aggregate = options.cardRepository.aggregates[0];
    expect(aggregate?.media.some((m) => m.type === MEDIA_TYPES.TTS)).toBe(true);
    expect(aggregate?.tags.map((tag) => tag.name).sort()).toEqual(['home', 'imported']);
  });

  it('counts file-media references as skipped (zip not imported yet)', async () => {
    const options = makeOptions();

    const result = await importCsvCards(
      {
        collectionId: 'col-1',
        cards: [makeParsedCard({ fileMediaRefs: ['media/images/x.png', 'media/audios/y.mp3'] })],
      },
      options,
    );

    expect(result.mediaSkipped).toBe(2);
    expect(result.imported).toBe(1);
  });

  it('skips invalid cards without aborting the batch (best-effort)', async () => {
    const options = makeOptions();

    const result = await importCsvCards(
      {
        collectionId: 'col-1',
        cards: [
          // Cloze with no blanks -> invalid -> skipped.
          makeParsedCard({ rowNumber: 2, type: CARD_TYPES.CLOZE, front: 'no blanks', back: 'x' }),
          makeParsedCard({ rowNumber: 3 }),
        ],
      },
      options,
    );

    expect(result.imported).toBe(1);
    expect(result.skipped).toEqual([{ rowNumber: 2, reason: IMPORT_SAVE_REASONS.CARD_INVALID }]);
  });

  it('throws when the target collection does not exist', async () => {
    const options = makeOptions();

    await expect(
      importCsvCards({ collectionId: 'missing', cards: [makeParsedCard()] }, options),
    ).rejects.toBeInstanceOf(ImportCollectionNotFoundError);
  });
});
