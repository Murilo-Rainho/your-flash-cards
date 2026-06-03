import type { SQLiteDatabase } from 'expo-sqlite';

export type SqliteDatabaseConnection = Pick<
  SQLiteDatabase,
  'execAsync' | 'runAsync' | 'getFirstAsync' | 'getAllAsync' | 'withTransactionAsync'
>;
