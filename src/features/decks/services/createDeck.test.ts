import type { Collection } from '@/domain/entities/Collection';
import type { Deck } from '@/domain/entities/Deck';
import type { CollectionRepository } from '@/domain/repositories/CollectionRepository';
import type { DeckRepository } from '@/domain/repositories/DeckRepository';

import { createDeck } from './createDeck';

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
  decks: Deck[] = [];

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

const collection: Collection = {
  id: 'collection-pt-en',
  name: 'Português para Inglês',
  baseLanguage: 'pt',
  targetLanguage: 'en',
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z',
};

describe('createDeck', () => {
  it('trims input and creates a deck for an existing collection', async () => {
    const deckRepository = new FakeDeckRepository();

    await expect(
      createDeck(
        {
          collectionId: 'collection-pt-en',
          name: '  Travel  ',
          description: '   ',
          autoGenerateReverseCards: true,
        },
        {
          collectionRepository: new FakeCollectionRepository([collection]),
          deckRepository,
          idFactory: () => 'deck-fixed',
          now: () => new Date('2026-06-03T12:00:00.000Z'),
        },
      ),
    ).resolves.toEqual({
      id: 'deck-fixed',
      collectionId: 'collection-pt-en',
      name: 'Travel',
      description: undefined,
      autoGenerateReverseCards: true,
      createdAt: '2026-06-03T12:00:00.000Z',
      updatedAt: '2026-06-03T12:00:00.000Z',
    });

    expect(deckRepository.decks).toHaveLength(1);
  });

  it('rejects a missing parent collection before persisting', async () => {
    const deckRepository = new FakeDeckRepository();

    await expect(
      createDeck(
        {
          collectionId: 'missing-collection',
          name: 'Travel',
          description: '',
          autoGenerateReverseCards: false,
        },
        {
          collectionRepository: new FakeCollectionRepository([]),
          deckRepository,
        },
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        collectionId: 'Escolha uma coleção existente.',
      },
    });

    expect(deckRepository.decks).toEqual([]);
  });

  it('rejects invalid form data before checking the repository', async () => {
    const deckRepository = new FakeDeckRepository();

    await expect(
      createDeck(
        {
          collectionId: '',
          name: '   ',
          description: '',
          autoGenerateReverseCards: false,
        },
        {
          collectionRepository: new FakeCollectionRepository([collection]),
          deckRepository,
        },
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        collectionId: 'Escolha uma coleção.',
        name: 'Informe o nome do deck.',
      },
    });

    expect(deckRepository.decks).toEqual([]);
  });
});
