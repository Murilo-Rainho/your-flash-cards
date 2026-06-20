import { describe, expect, it } from '@jest/globals';

import { CARD_TYPES } from '@/constants/cardTypes';
import type { Deck } from '@/domain/entities/Deck';
import { MEDIA_SIDES, MEDIA_TYPES } from '@/domain/entities/Media';
import { VARIANT_TYPES } from '@/domain/entities/CardVariant';
import type { CardAggregate, CardRepository } from '@/domain/repositories/CardRepository';
import type { DeckRepository } from '@/domain/repositories/DeckRepository';
import type {
  LocalMediaStorage,
  PersistLocalMediaInput,
} from '@/domain/services/LocalMediaStorage';

import { updateCard } from './updateCard';

class FakeCardRepository implements CardRepository {
  constructor(public aggregates: CardAggregate[] = []) {}

  async createAggregate(aggregate: CardAggregate) {
    this.aggregates.push(aggregate);
    return aggregate;
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

class FakeDeckRepository implements DeckRepository {
  constructor(private readonly decks: Deck[]) {}

  async create(deck: Deck) {
    this.decks.push(deck);
    return deck;
  }

  async update(deck: Deck) {
    const index = this.decks.findIndex((existing) => existing.id === deck.id);
    if (index >= 0) {
      this.decks[index] = deck;
    }
    return deck;
  }

  async listActiveByCollection(collectionId: string) {
    return this.decks.filter((deck) => deck.collectionId === collectionId && !deck.archivedAt);
  }

  async findById(id: string) {
    return this.decks.find((deck) => deck.id === id && !deck.archivedAt) ?? null;
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

const deckA: Deck = {
  id: 'deck-a',
  collectionId: 'collection-pt-en',
  name: 'Deck A',
  autoGenerateReverseCards: false,
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z',
};

const deckB: Deck = {
  id: 'deck-b',
  collectionId: 'collection-pt-en',
  name: 'Deck B',
  autoGenerateReverseCards: false,
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z',
};

const deckOther: Deck = {
  id: 'deck-other',
  collectionId: 'collection-es-en',
  name: 'Deck Other',
  autoGenerateReverseCards: false,
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z',
};

function seedVocabularyAggregate(): CardAggregate {
  return {
    card: {
      id: 'card-1',
      deckId: 'deck-a',
      type: CARD_TYPES.VOCABULARY,
      front: 'gato',
      back: 'cat',
      notes: undefined,
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-01T12:00:00.000Z',
    },
    variants: [
      {
        id: 'variant-1',
        cardId: 'card-1',
        variantType: VARIANT_TYPES.ORIGINAL,
        isGenerated: false,
        createdAt: '2026-06-01T12:00:00.000Z',
        updatedAt: '2026-06-01T12:00:00.000Z',
      },
    ],
    media: [],
    tags: [],
    reviewItems: [
      {
        id: 'review-1',
        cardVariantId: 'variant-1',
        schedulerType: 'sm2',
        schedulerVersion: 'v1',
        repetitions: 3,
        intervalDays: 10,
        easeFactor: 2.6,
        nextReviewAt: '2026-06-20T12:00:00.000Z',
        lapses: 0,
        createdAt: '2026-06-01T12:00:00.000Z',
        updatedAt: '2026-06-10T12:00:00.000Z',
      },
    ],
  };
}

describe('updateCard', () => {
  it('updates text fields and preserves variants and review items', async () => {
    const cardRepository = new FakeCardRepository([seedVocabularyAggregate()]);
    const deckRepository = new FakeDeckRepository([deckA, deckB]);
    const mediaStorage = new FakeMediaStorage();

    const result = await updateCard(
      {
        id: 'card-1',
        deckId: 'deck-a',
        frontText: '  gatinho  ',
        backText: 'kitten',
        notes: 'informal',
        tags: ['Animais'],
      },
      {
        cardRepository,
        deckRepository,
        mediaStorage,
        idFactory: (prefix) => `${prefix}-fixed`,
        now: () => new Date('2026-06-15T12:00:00.000Z'),
      },
    );

    expect(result.card.front).toBe('gatinho');
    expect(result.card.back).toBe('kitten');
    expect(result.card.notes).toBe('informal');
    expect(result.card.updatedAt).toBe('2026-06-15T12:00:00.000Z');
    expect(result.card.createdAt).toBe('2026-06-01T12:00:00.000Z');
    expect(result.variants).toHaveLength(1);
    expect(result.reviewItems[0]?.repetitions).toBe(3);
    expect(result.tags.map((tag) => tag.name)).toEqual(['Animais']);
    expect(result.tags[0]?.collectionId).toBe('collection-pt-en');
  });

  it('moves the card to another deck of the same collection', async () => {
    const cardRepository = new FakeCardRepository([seedVocabularyAggregate()]);
    const deckRepository = new FakeDeckRepository([deckA, deckB]);
    const mediaStorage = new FakeMediaStorage();

    const result = await updateCard(
      { id: 'card-1', deckId: 'deck-b', frontText: 'gato', backText: 'cat' },
      { cardRepository, deckRepository, mediaStorage },
    );

    expect(result.card.deckId).toBe('deck-b');
  });

  it('rejects moving the card to a deck from another collection', async () => {
    const cardRepository = new FakeCardRepository([seedVocabularyAggregate()]);
    const deckRepository = new FakeDeckRepository([deckA, deckOther]);
    const mediaStorage = new FakeMediaStorage();

    await expect(
      updateCard(
        { id: 'card-1', deckId: 'deck-other', frontText: 'gato', backText: 'cat' },
        { cardRepository, deckRepository, mediaStorage },
      ),
    ).rejects.toMatchObject({
      fieldErrors: { deckId: 'Escolha um deck desta colecao.' },
    });
  });

  it('rejects when the card does not exist', async () => {
    const cardRepository = new FakeCardRepository([]);
    const deckRepository = new FakeDeckRepository([deckA]);
    const mediaStorage = new FakeMediaStorage();

    await expect(
      updateCard(
        { id: 'missing', deckId: 'deck-a', frontText: 'x', backText: 'y' },
        { cardRepository, deckRepository, mediaStorage },
      ),
    ).rejects.toMatchObject({
      fieldErrors: { id: 'Card nao encontrado.' },
    });
  });

  it('copies new media and deletes media removed from the card', async () => {
    const aggregate = seedVocabularyAggregate();
    aggregate.media = [
      {
        id: 'media-old',
        cardId: 'card-1',
        side: MEDIA_SIDES.FRONT,
        type: MEDIA_TYPES.IMAGE,
        uri: 'file://cards/card-1/media-old',
        mimeType: 'image/png',
        createdAt: '2026-06-01T12:00:00.000Z',
        updatedAt: '2026-06-01T12:00:00.000Z',
      },
    ];
    const cardRepository = new FakeCardRepository([aggregate]);
    const deckRepository = new FakeDeckRepository([deckA]);
    const mediaStorage = new FakeMediaStorage();

    const result = await updateCard(
      {
        id: 'card-1',
        deckId: 'deck-a',
        frontText: 'gato',
        backText: 'cat',
        media: [
          {
            side: MEDIA_SIDES.FRONT,
            type: MEDIA_TYPES.IMAGE,
            uri: 'file://picker/new-image.png',
            mimeType: 'image/png',
          },
        ],
      },
      {
        cardRepository,
        deckRepository,
        mediaStorage,
        idFactory: (prefix) => `${prefix}-new`,
      },
    );

    expect(mediaStorage.copies).toHaveLength(1);
    expect(mediaStorage.deletedUris).toContain('file://cards/card-1/media-old');
    expect(result.media).toHaveLength(1);
    expect(result.media[0]?.uri).toBe('file://cards/card-1/media-new');
  });

  it('keeps already-stored media without re-copying it', async () => {
    const aggregate = seedVocabularyAggregate();
    aggregate.media = [
      {
        id: 'media-keep',
        cardId: 'card-1',
        side: MEDIA_SIDES.FRONT,
        type: MEDIA_TYPES.IMAGE,
        uri: 'file://cards/card-1/media-keep',
        mimeType: 'image/png',
        createdAt: '2026-06-01T12:00:00.000Z',
        updatedAt: '2026-06-01T12:00:00.000Z',
      },
    ];
    const cardRepository = new FakeCardRepository([aggregate]);
    const deckRepository = new FakeDeckRepository([deckA]);
    const mediaStorage = new FakeMediaStorage();

    const result = await updateCard(
      {
        id: 'card-1',
        deckId: 'deck-a',
        frontText: 'gato',
        backText: 'cat',
        media: [
          {
            side: MEDIA_SIDES.FRONT,
            type: MEDIA_TYPES.IMAGE,
            uri: 'file://cards/card-1/media-keep',
            mimeType: 'image/png',
          },
        ],
      },
      { cardRepository, deckRepository, mediaStorage },
    );

    expect(mediaStorage.copies).toHaveLength(0);
    expect(mediaStorage.deletedUris).toHaveLength(0);
    expect(result.media[0]?.id).toBe('media-keep');
  });
});
