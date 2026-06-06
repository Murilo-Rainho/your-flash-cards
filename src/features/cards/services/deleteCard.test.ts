import { CARD_TYPES } from '@/constants/cardTypes';
import type { CardAggregate, CardRepository } from '@/domain/repositories/CardRepository';

import { deleteCard } from './deleteCard';

class FakeCardRepository implements CardRepository {
  constructor(public aggregates: CardAggregate[] = []) {}

  async createAggregate(aggregate: CardAggregate) {
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
    return aggregate;
  }

  async archiveCard(id: string, archivedAt: string) {
    const aggregate = this.aggregates.find((existing) => existing.card.id === id);
    if (aggregate) {
      aggregate.card = { ...aggregate.card, archivedAt };
    }
  }
}

function seedAggregate(): CardAggregate {
  return {
    card: {
      id: 'card-1',
      deckId: 'deck-a',
      type: CARD_TYPES.VOCABULARY,
      front: 'gato',
      back: 'cat',
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-01T12:00:00.000Z',
    },
    variants: [],
    media: [],
    tags: [],
    reviewItems: [],
  };
}

describe('deleteCard', () => {
  it('archives the card with the provided timestamp', async () => {
    const cardRepository = new FakeCardRepository([seedAggregate()]);

    await deleteCard('card-1', {
      cardRepository,
      now: () => new Date('2026-06-15T12:00:00.000Z'),
    });

    expect(cardRepository.aggregates[0]?.card.archivedAt).toBe('2026-06-15T12:00:00.000Z');
  });

  it('ignores an empty id', async () => {
    const cardRepository = new FakeCardRepository([seedAggregate()]);

    await deleteCard('   ', { cardRepository });

    expect(cardRepository.aggregates[0]?.card.archivedAt).toBeUndefined();
  });
});
