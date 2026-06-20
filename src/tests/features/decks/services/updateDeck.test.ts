import { describe, expect, it } from '@jest/globals';

import type { Deck } from '@/domain/entities/Deck';
import type { DeckRepository } from '@/domain/repositories/DeckRepository';

import { updateDeck } from '@/features/decks/services/updateDeck';

class FakeDeckRepository implements DeckRepository {
  decks: Deck[] = [];

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

function seedDeck(repository: FakeDeckRepository): Deck {
  const deck: Deck = {
    id: 'deck-1',
    collectionId: 'collection-pt-en',
    name: 'Travel',
    description: 'Original',
    autoGenerateReverseCards: false,
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
  };
  repository.decks.push(deck);
  return deck;
}

describe('updateDeck', () => {
  it('updates editable fields and keeps the parent collection, bumping updatedAt', async () => {
    const repository = new FakeDeckRepository();
    seedDeck(repository);

    await expect(
      updateDeck(
        {
          id: 'deck-1',
          name: '  Travel & Food  ',
          description: '   ',
          autoGenerateReverseCards: true,
        },
        {
          deckRepository: repository,
          now: () => new Date('2026-06-05T12:00:00.000Z'),
        },
      ),
    ).resolves.toEqual({
      id: 'deck-1',
      collectionId: 'collection-pt-en',
      name: 'Travel & Food',
      description: undefined,
      autoGenerateReverseCards: true,
      createdAt: '2026-06-01T10:00:00.000Z',
      updatedAt: '2026-06-05T12:00:00.000Z',
    });
  });

  it('rejects an empty name before persisting', async () => {
    const repository = new FakeDeckRepository();
    seedDeck(repository);

    await expect(
      updateDeck(
        { id: 'deck-1', name: '   ', autoGenerateReverseCards: false },
        { deckRepository: repository },
      ),
    ).rejects.toMatchObject({
      fieldErrors: { name: 'Informe o nome do deck.' },
    });

    expect(repository.decks[0]?.name).toBe('Travel');
  });

  it('rejects when the deck does not exist', async () => {
    const repository = new FakeDeckRepository();

    await expect(
      updateDeck(
        { id: 'missing', name: 'Qualquer', autoGenerateReverseCards: false },
        { deckRepository: repository },
      ),
    ).rejects.toMatchObject({
      fieldErrors: { name: 'Deck não encontrado.' },
    });
  });
});
