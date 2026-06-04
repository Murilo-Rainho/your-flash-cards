import { CARD_TYPES } from '@/constants/cardTypes';
import type { Collection } from '@/domain/entities/Collection';
import type { Deck } from '@/domain/entities/Deck';
import { MEDIA_SIDES, MEDIA_TYPES } from '@/domain/entities/Media';
import type { CardAggregate, CardRepository } from '@/domain/repositories/CardRepository';
import type { CollectionRepository } from '@/domain/repositories/CollectionRepository';
import type { DeckRepository } from '@/domain/repositories/DeckRepository';
import type {
  LocalMediaStorage,
  PersistLocalMediaInput,
} from '@/domain/services/LocalMediaStorage';

import { createCard } from './createCard';

class FakeCollectionRepository implements CollectionRepository {
  constructor(private readonly collections: Collection[]) {}

  async create(collection: Collection): Promise<Collection> {
    this.collections.push(collection);
    return collection;
  }

  async listActive(): Promise<Collection[]> {
    return this.collections;
  }

  async findById(id: string): Promise<Collection | null> {
    return this.collections.find((collection) => collection.id === id) ?? null;
  }
}

class FakeDeckRepository implements DeckRepository {
  constructor(private readonly decks: Deck[]) {}

  async create(deck: Deck): Promise<Deck> {
    this.decks.push(deck);
    return deck;
  }

  async listActiveByCollection(collectionId: string): Promise<Deck[]> {
    return this.decks.filter((deck) => deck.collectionId === collectionId && !deck.archivedAt);
  }

  async findById(id: string): Promise<Deck | null> {
    return this.decks.find((deck) => deck.id === id && !deck.archivedAt) ?? null;
  }
}

class FakeCardRepository implements CardRepository {
  aggregates: CardAggregate[] = [];

  constructor(private readonly shouldFail = false) {}

  async createAggregate(aggregate: CardAggregate): Promise<CardAggregate> {
    if (this.shouldFail) {
      throw new Error('db failed');
    }

    this.aggregates.push(aggregate);
    return aggregate;
  }
}

class FakeMediaStorage implements LocalMediaStorage {
  copies: PersistLocalMediaInput[] = [];
  deletedUris: string[] = [];

  async copyToCard(input: PersistLocalMediaInput) {
    this.copies.push(input);

    return {
      uri: `file://cards/${input.cardId}/${input.mediaId}`,
      mimeType: input.mimeType,
    };
  }

  async deleteMany(uris: readonly string[]): Promise<void> {
    this.deletedUris.push(...uris);
  }
}

const collection: Collection = {
  id: 'collection-pt-en',
  name: 'Portugues para Ingles',
  baseLanguage: 'pt',
  targetLanguage: 'en',
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z',
};

const deck: Deck = {
  id: 'deck-travel',
  collectionId: 'collection-pt-en',
  name: 'Travel',
  autoGenerateReverseCards: false,
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z',
};

const reverseDeck: Deck = {
  ...deck,
  id: 'deck-reverse',
  autoGenerateReverseCards: true,
};

const otherCollectionDeck: Deck = {
  ...deck,
  id: 'deck-other-collection',
  collectionId: 'collection-es-en',
};

function createIdFactory() {
  const counts = new Map<string, number>();

  return (prefix: string) => {
    const nextValue = (counts.get(prefix) ?? 0) + 1;
    counts.set(prefix, nextValue);
    return `${prefix}-${nextValue}`;
  };
}

function createOptions({
  decks = [deck],
  cardRepository = new FakeCardRepository(),
  mediaStorage = new FakeMediaStorage(),
}: {
  decks?: Deck[];
  cardRepository?: FakeCardRepository;
  mediaStorage?: FakeMediaStorage;
} = {}) {
  return {
    cardRepository,
    collectionRepository: new FakeCollectionRepository([collection]),
    deckRepository: new FakeDeckRepository(decks),
    mediaStorage,
    idFactory: createIdFactory(),
    now: () => new Date('2026-06-03T12:00:00.000Z'),
  };
}

describe('createCard', () => {
  it('creates an audio-front vocabulary card and keeps empty front text', async () => {
    const cardRepository = new FakeCardRepository();
    const mediaStorage = new FakeMediaStorage();

    const aggregate = await createCard(
      {
        collectionId: 'collection-pt-en',
        deckId: 'deck-travel',
        type: CARD_TYPES.VOCABULARY,
        frontText: '',
        backText: 'casa',
        tags: [' travel ', 'Travel'],
        media: [
          {
            side: MEDIA_SIDES.FRONT,
            type: MEDIA_TYPES.AUDIO,
            uri: 'file://cache/house.mp3',
            mimeType: 'audio/mpeg',
            fileName: 'house.mp3',
          },
        ],
      },
      createOptions({ cardRepository, mediaStorage }),
    );

    expect(aggregate.card).toMatchObject({
      id: 'card-1',
      deckId: 'deck-travel',
      type: CARD_TYPES.VOCABULARY,
      front: '',
      back: 'casa',
    });
    expect(aggregate.tags).toHaveLength(1);
    expect(aggregate.tags[0]).toMatchObject({ name: 'Travel', normalizedName: 'travel' });
    expect(aggregate.media[0]).toMatchObject({
      side: MEDIA_SIDES.FRONT,
      type: MEDIA_TYPES.AUDIO,
      uri: 'file://cards/card-1/media-1',
    });
    expect(mediaStorage.copies).toHaveLength(1);
    expect(cardRepository.aggregates).toHaveLength(1);
  });

  it('generates reverse variant and review items when the deck is configured for reverse cards', async () => {
    const aggregate = await createCard(
      {
        collectionId: 'collection-pt-en',
        deckId: 'deck-reverse',
        type: CARD_TYPES.CLOZE,
        frontText: "I'm {cansado} now",
        backText: "I'm tired now",
      },
      createOptions({ decks: [reverseDeck] }),
    );

    expect(aggregate.variants).toEqual([
      expect.objectContaining({ variantType: 'original', isGenerated: false }),
      expect.objectContaining({ variantType: 'reverse', isGenerated: true }),
    ]);
    expect(aggregate.reviewItems).toHaveLength(2);
    expect(aggregate.reviewItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          schedulerType: 'sm2',
          schedulerVersion: 'v1',
          easeFactor: 2.5,
          nextReviewAt: '2026-06-03T12:00:00.000Z',
        }),
      ]),
    );
  });

  it('rejects a deck from another collection before persisting', async () => {
    await expect(
      createCard(
        {
          collectionId: 'collection-pt-en',
          deckId: 'deck-other-collection',
          type: CARD_TYPES.VOCABULARY,
          frontText: 'house',
          backText: 'casa',
        },
        createOptions({ decks: [otherCollectionDeck] }),
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        deckId: 'Escolha um deck desta colecao.',
      },
    });
  });

  it('rejects type-specific invalid inputs before persisting', async () => {
    await expect(
      createCard(
        {
          collectionId: 'collection-pt-en',
          deckId: 'deck-travel',
          type: CARD_TYPES.LISTENING,
          frontText: 'hello',
          backText: 'ola',
        },
        createOptions(),
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        frontMedia: 'Adicione audio, gravacao ou TTS na frente.',
      },
    });

    await expect(
      createCard(
        {
          collectionId: 'collection-pt-en',
          deckId: 'deck-travel',
          type: CARD_TYPES.TYPING,
          frontText: 'Estou cansado.',
          backText: '',
        },
        createOptions(),
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        backText: 'Informe a resposta esperada.',
      },
    });

    await expect(
      createCard(
        {
          collectionId: 'collection-pt-en',
          deckId: 'deck-travel',
          type: CARD_TYPES.VOCABULARY,
          frontText: '',
          backText: 'hello',
          media: [{ side: MEDIA_SIDES.FRONT, type: MEDIA_TYPES.TTS, language: 'en-US' }],
        },
        createOptions(),
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        frontText: 'Informe texto para usar TTS local.',
      },
    });
  });

  it('persists cloze front with braces and rejects invalid cloze structure', async () => {
    const aggregate = await createCard(
      {
        collectionId: 'collection-pt-en',
        deckId: 'deck-travel',
        type: CARD_TYPES.CLOZE,
        frontText: "I'm {cansado} now",
        backText: "I'm tired now",
      },
      createOptions(),
    );

    expect(aggregate.card.front).toBe("I'm {cansado} now");
    expect(aggregate.card.back).toBe("I'm tired now");

    await expect(
      createCard(
        {
          collectionId: 'collection-pt-en',
          deckId: 'deck-travel',
          type: CARD_TYPES.CLOZE,
          frontText: "I'm ____ now",
          backText: "I'm tired now",
        },
        createOptions(),
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        frontText: 'Use {lacuna} para marcar a lacuna na frase.',
      },
    });

    await expect(
      createCard(
        {
          collectionId: 'collection-pt-en',
          deckId: 'deck-travel',
          type: CARD_TYPES.CLOZE,
          frontText: "I'm {cansado} now",
          backText: 'I am tired now',
        },
        createOptions(),
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        backText:
          'O verso deve ter a mesma estrutura da frente, com a resposta no lugar da lacuna.',
      },
    });
  });

  it('rejects media in cloze cards', async () => {
    await expect(
      createCard(
        {
          collectionId: 'collection-pt-en',
          deckId: 'deck-travel',
          type: CARD_TYPES.CLOZE,
          frontText: "I'm {cansado} now",
          backText: "I'm tired now",
          media: [
            {
              side: MEDIA_SIDES.FRONT,
              type: MEDIA_TYPES.AUDIO,
              uri: 'file://cache/audio.mp3',
              mimeType: 'audio/mpeg',
            },
          ],
        },
        createOptions(),
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        frontMedia: 'Preencher lacuna aceita apenas texto.',
        backMedia: 'Preencher lacuna aceita apenas texto.',
      },
    });
  });

  it('rejects pronunciation cards without front audio or back text', async () => {
    await expect(
      createCard(
        {
          collectionId: 'collection-pt-en',
          deckId: 'deck-travel',
          type: CARD_TYPES.PRONUNCIATION,
          frontText: '',
          backText: 'repeat this',
        },
        createOptions(),
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        frontMedia: 'Adicione audio ou gravacao na frente.',
      },
    });

    await expect(
      createCard(
        {
          collectionId: 'collection-pt-en',
          deckId: 'deck-travel',
          type: CARD_TYPES.PRONUNCIATION,
          frontText: '',
          backText: '',
          media: [
            {
              side: MEDIA_SIDES.FRONT,
              type: MEDIA_TYPES.RECORDING,
              uri: 'file://cache/pronunciation.m4a',
              mimeType: 'audio/m4a',
            },
          ],
        },
        createOptions(),
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        backText: 'Informe o texto que sera falado no verso.',
      },
    });
  });

  it('cleans copied media when aggregate persistence fails', async () => {
    const mediaStorage = new FakeMediaStorage();

    await expect(
      createCard(
        {
          collectionId: 'collection-pt-en',
          deckId: 'deck-travel',
          type: CARD_TYPES.VOCABULARY,
          frontText: '',
          backText: 'casa',
          media: [
            {
              side: MEDIA_SIDES.FRONT,
              type: MEDIA_TYPES.AUDIO,
              uri: 'file://cache/house.mp3',
              mimeType: 'audio/mpeg',
            },
          ],
        },
        createOptions({
          cardRepository: new FakeCardRepository(true),
          mediaStorage,
        }),
      ),
    ).rejects.toThrow('db failed');

    expect(mediaStorage.deletedUris).toEqual(['file://cards/card-1/media-1']);
  });
});
