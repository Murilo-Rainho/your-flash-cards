import type { CardRepository } from '@/domain/repositories/CardRepository';
import type { CollectionRepository } from '@/domain/repositories/CollectionRepository';
import type { DeckRepository } from '@/domain/repositories/DeckRepository';
import type { HomeReadRepository } from '@/domain/repositories/HomeReadRepository';
import { getAppDatabase } from '@/infrastructure/database/sqlite/database';

import { SQLiteCardRepository } from './SQLiteCardRepository';
import { SQLiteCollectionRepository } from './SQLiteCollectionRepository';
import { SQLiteDeckRepository } from './SQLiteDeckRepository';
import { SQLiteHomeReadRepository } from './SQLiteHomeReadRepository';

let homeReadRepository: HomeReadRepository | null = null;
let collectionRepository: CollectionRepository | null = null;
let deckRepository: DeckRepository | null = null;
let cardRepository: CardRepository | null = null;

export function getSQLiteHomeReadRepository(): HomeReadRepository {
  if (!homeReadRepository) {
    homeReadRepository = new SQLiteHomeReadRepository(getAppDatabase);
  }

  return homeReadRepository;
}

export function getSQLiteCollectionRepository(): CollectionRepository {
  if (!collectionRepository) {
    collectionRepository = new SQLiteCollectionRepository(getAppDatabase);
  }

  return collectionRepository;
}

export function getSQLiteDeckRepository(): DeckRepository {
  if (!deckRepository) {
    deckRepository = new SQLiteDeckRepository(getAppDatabase);
  }

  return deckRepository;
}

export function getSQLiteCardRepository(): CardRepository {
  if (!cardRepository) {
    cardRepository = new SQLiteCardRepository(getAppDatabase);
  }

  return cardRepository;
}
