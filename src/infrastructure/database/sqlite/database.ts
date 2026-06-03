import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { migrateSqliteDatabase } from './migrate';

const DATABASE_NAME = 'your_flash_cards.db';

let databasePromise: Promise<SQLiteDatabase> | null = null;

export function getAppDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync(DATABASE_NAME)
      .then(async (db) => {
        await migrateSqliteDatabase(db);
        return db;
      })
      .catch((error: unknown) => {
        databasePromise = null;
        throw error;
      });
  }

  return databasePromise;
}
