import type { AppSettingsRepository } from '@/domain/repositories/AppSettingsRepository';
import type { CardRepository } from '@/domain/repositories/CardRepository';
import type { CardListReadRepository } from '@/domain/repositories/CardListReadRepository';
import type { CollectionRepository } from '@/domain/repositories/CollectionRepository';
import type { DeckRepository } from '@/domain/repositories/DeckRepository';
import type { HomeReadRepository } from '@/domain/repositories/HomeReadRepository';
import type { ReviewRepository } from '@/domain/repositories/ReviewRepository';
import type { TagRepository } from '@/domain/repositories/TagRepository';
import { getAppDatabase } from '@/infrastructure/database/sqlite/database';

import { SQLiteAppSettingsRepository } from './SQLiteAppSettingsRepository';
import { SQLiteCardRepository } from './SQLiteCardRepository';
import { SQLiteCardListReadRepository } from './SQLiteCardListReadRepository';
import { SQLiteCollectionRepository } from './SQLiteCollectionRepository';
import { SQLiteDeckRepository } from './SQLiteDeckRepository';
import { SQLiteHomeReadRepository } from './SQLiteHomeReadRepository';
import { SQLiteDevToolsRepository } from './SQLiteDevToolsRepository';
import { SQLiteReviewRepository } from './SQLiteReviewRepository';
import { SQLiteTagRepository } from './SQLiteTagRepository';

let homeReadRepository: HomeReadRepository | null = null;
let collectionRepository: CollectionRepository | null = null;
let deckRepository: DeckRepository | null = null;
let cardRepository: CardRepository | null = null;
let cardListReadRepository: CardListReadRepository | null = null;
let tagRepository: TagRepository | null = null;
let appSettingsRepository: AppSettingsRepository | null = null;
let reviewRepository: ReviewRepository | null = null;
let devToolsRepository: SQLiteDevToolsRepository | null = null;

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

export function getSQLiteCardListReadRepository(): CardListReadRepository {
  if (!cardListReadRepository) {
    cardListReadRepository = new SQLiteCardListReadRepository(getAppDatabase);
  }

  return cardListReadRepository;
}

export function getSQLiteTagRepository(): TagRepository {
  if (!tagRepository) {
    tagRepository = new SQLiteTagRepository(getAppDatabase);
  }

  return tagRepository;
}

export function getSQLiteAppSettingsRepository(): AppSettingsRepository {
  if (!appSettingsRepository) {
    appSettingsRepository = new SQLiteAppSettingsRepository(getAppDatabase);
  }

  return appSettingsRepository;
}

export function getSQLiteReviewRepository(): ReviewRepository {
  if (!reviewRepository) {
    reviewRepository = new SQLiteReviewRepository(getAppDatabase);
  }

  return reviewRepository;
}

export function getSQLiteDevToolsRepository(): SQLiteDevToolsRepository {
  if (!devToolsRepository) {
    devToolsRepository = new SQLiteDevToolsRepository(getAppDatabase);
  }

  return devToolsRepository;
}
