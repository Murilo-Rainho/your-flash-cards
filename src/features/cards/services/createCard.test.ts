import { CARD_TYPES } from '@/constants/cardTypes';
import { buildClozeContent } from '@/domain/cloze/clozeContent';
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

  async update(collection: Collection): Promise<Collection> {
    const index = this.collections.findIndex((existing) => existing.id === collection.id);
    if (index >= 0) {
      this.collections[index] = collection;
    }
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

  async update(deck: Deck): Promise<Deck> {
    const index = this.decks.findIndex((existing) => existing.id === deck.id);
    if (index >= 0) {
      this.decks[index] = deck;
    }
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

  async listActiveByDeck(deckId: string) {
    return this.aggregates
      .map((aggregate) => aggregate.card)
      .filter((card) => card.deckId === deckId && !card.archivedAt);
  }

  async findAggregateById(id: string) {
    return this.aggregates.find((aggregate) => aggregate.card.id === id) ?? null;
  }

  async updateAggregate(aggregate: CardAggregate) {
    const index = this.aggregates.findIndex((existing) => existing.card.id === aggregate.card.id);
    if (index >= 0) {
      this.aggregates[index] = aggregate;
    }
    return aggregate;
  }

  async archiveCard(id: string, archivedAt: string) {
    const aggregate = this.aggregates.find((existing) => existing.card.id === id);
    if (aggregate) {
      aggregate.card = { ...aggregate.card, archivedAt };
    }
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
    expect(aggregate.tags[0]).toMatchObject({
      collectionId: 'collection-pt-en',
      name: 'Travel',
      normalizedName: 'travel',
    });
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
        cloze: buildClozeContent("I'm {cansado} now", [['tired']]),
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

  it('derives front/back and persists structured cloze (single blank)', async () => {
    const aggregate = await createCard(
      {
        collectionId: 'collection-pt-en',
        deckId: 'deck-travel',
        type: CARD_TYPES.CLOZE,
        cloze: buildClozeContent("I'm {cansado} now", [['tired']]),
      },
      createOptions(),
    );

    expect(aggregate.card.front).toBe("I'm {cansado} now");
    expect(aggregate.card.back).toBe("I'm tired now");
    expect(aggregate.card.cloze).toEqual(buildClozeContent("I'm {cansado} now", [['tired']]));
  });

  it('supports multiple blanks and multiple accepted answers per blank', async () => {
    const aggregate = await createCard(
      {
        collectionId: 'collection-pt-en',
        deckId: 'deck-travel',
        type: CARD_TYPES.CLOZE,
        cloze: buildClozeContent('I would like {ambos} water {e} juice.', [
          ['both', 'the two'],
          ['and'],
        ]),
      },
      createOptions(),
    );

    expect(aggregate.card.front).toBe('I would like {ambos} water {e} juice.');
    // O verso usa a resposta primária (a primeira) de cada lacuna.
    expect(aggregate.card.back).toBe('I would like both water and juice.');
    expect(aggregate.card.cloze?.segments).toContainEqual({
      kind: 'blank',
      hint: 'ambos',
      answers: ['both', 'the two'],
    });
  });

  it('rejects a sentence without blanks', async () => {
    await expect(
      createCard(
        {
          collectionId: 'collection-pt-en',
          deckId: 'deck-travel',
          type: CARD_TYPES.CLOZE,
          cloze: buildClozeContent("I'm tired now", []),
        },
        createOptions(),
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        frontText: 'Marque ao menos uma lacuna na frase.',
      },
    });
  });

  it('rejects a blank without any accepted answer', async () => {
    await expect(
      createCard(
        {
          collectionId: 'collection-pt-en',
          deckId: 'deck-travel',
          type: CARD_TYPES.CLOZE,
          cloze: buildClozeContent("I'm {cansado} now", [[]]),
        },
        createOptions(),
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        backText: 'Cada lacuna precisa de ao menos uma resposta aceita.',
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
          cloze: buildClozeContent("I'm {cansado} now", [['tired']]),
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

  it('rejects pronunciation cards without front text', async () => {
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
              side: MEDIA_SIDES.BACK,
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
        frontText: 'Informe o texto para pronunciar na frente.',
      },
    });
  });

  it('rejects pronunciation cards without back audio', async () => {
    await expect(
      createCard(
        {
          collectionId: 'collection-pt-en',
          deckId: 'deck-travel',
          type: CARD_TYPES.PRONUNCIATION,
          frontText: "I'm tired now.",
          backText: '',
        },
        createOptions(),
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        backMedia: 'Adicione audio, gravacao ou TTS no verso.',
      },
    });
  });

  it('creates a pronunciation card with front text and a back model recording', async () => {
    const aggregate = await createCard(
      {
        collectionId: 'collection-pt-en',
        deckId: 'deck-travel',
        type: CARD_TYPES.PRONUNCIATION,
        frontText: "I'm tired now.",
        backText: '',
        media: [
          {
            side: MEDIA_SIDES.BACK,
            type: MEDIA_TYPES.RECORDING,
            uri: 'file://cache/pronunciation.m4a',
            mimeType: 'audio/m4a',
          },
        ],
      },
      createOptions(),
    );

    expect(aggregate.card).toMatchObject({
      type: CARD_TYPES.PRONUNCIATION,
      front: "I'm tired now.",
      back: '',
    });
    expect(aggregate.media).toHaveLength(1);
    expect(aggregate.media[0]).toMatchObject({
      side: MEDIA_SIDES.BACK,
      type: MEDIA_TYPES.RECORDING,
    });
  });

  it('creates a listening card with front audio and a mandatory back transcription', async () => {
    const aggregate = await createCard(
      {
        collectionId: 'collection-pt-en',
        deckId: 'deck-travel',
        type: CARD_TYPES.LISTENING,
        frontText: '',
        backText: "I'm tired now.",
        media: [
          {
            side: MEDIA_SIDES.FRONT,
            type: MEDIA_TYPES.AUDIO,
            uri: 'file://cache/listen.mp3',
            mimeType: 'audio/mpeg',
          },
        ],
      },
      createOptions(),
    );

    expect(aggregate.card).toMatchObject({ type: CARD_TYPES.LISTENING, back: "I'm tired now." });
    expect(aggregate.media).toHaveLength(1);
    expect(aggregate.media[0]).toMatchObject({ side: MEDIA_SIDES.FRONT, type: MEDIA_TYPES.AUDIO });
  });

  it('rejects a listening card without a back transcription', async () => {
    await expect(
      createCard(
        {
          collectionId: 'collection-pt-en',
          deckId: 'deck-travel',
          type: CARD_TYPES.LISTENING,
          backText: '',
          media: [
            {
              side: MEDIA_SIDES.FRONT,
              type: MEDIA_TYPES.AUDIO,
              uri: 'file://cache/listen.mp3',
              mimeType: 'audio/mpeg',
            },
          ],
        },
        createOptions(),
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        backText: 'Escreva a transcricao da frase no verso.',
      },
    });
  });

  it('rejects media on the back of a vocabulary card', async () => {
    await expect(
      createCard(
        {
          collectionId: 'collection-pt-en',
          deckId: 'deck-travel',
          type: CARD_TYPES.VOCABULARY,
          frontText: 'house',
          backText: 'casa',
          media: [
            {
              side: MEDIA_SIDES.BACK,
              type: MEDIA_TYPES.IMAGE,
              uri: 'file://cache/casa.png',
              mimeType: 'image/png',
            },
          ],
        },
        createOptions(),
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        backMedia: 'Verso do vocabulario aceita apenas texto.',
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
