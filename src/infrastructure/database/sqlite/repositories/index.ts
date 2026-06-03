import type { HomeReadRepository } from '@/domain/repositories/HomeReadRepository';
import { getAppDatabase } from '@/infrastructure/database/sqlite/database';

import { SQLiteHomeReadRepository } from './SQLiteHomeReadRepository';

let homeReadRepository: HomeReadRepository | null = null;

export function getSQLiteHomeReadRepository(): HomeReadRepository {
  if (!homeReadRepository) {
    homeReadRepository = new SQLiteHomeReadRepository(getAppDatabase);
  }

  return homeReadRepository;
}
