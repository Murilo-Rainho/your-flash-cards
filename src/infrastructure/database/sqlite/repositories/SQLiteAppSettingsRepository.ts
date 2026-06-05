import type { AppSettingsRepository } from '@/domain/repositories/AppSettingsRepository';

import type { SqliteDatabaseConnection } from '../types';

type GetDatabase = () => Promise<SqliteDatabaseConnection>;

type AppSettingRow = {
  value: string;
};

export class SQLiteAppSettingsRepository implements AppSettingsRepository {
  constructor(private readonly getDatabase: GetDatabase) {}

  async get(key: string): Promise<string | null> {
    const db = await this.getDatabase();
    const row = await db.getFirstAsync<AppSettingRow>(
      `
SELECT value
FROM app_settings
WHERE key = $key`,
      { $key: key },
    );

    return row?.value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    const db = await this.getDatabase();
    const updatedAt = new Date().toISOString();

    await db.runAsync(
      `
INSERT INTO app_settings (key, value, updated_at)
VALUES ($key, $value, $updatedAt)
ON CONFLICT(key) DO UPDATE SET
  value = excluded.value,
  updated_at = excluded.updated_at`,
      { $key: key, $value: value, $updatedAt: updatedAt },
    );
  }

  async getMany(keys: readonly string[]): Promise<Record<string, string | null>> {
    if (keys.length === 0) {
      return {};
    }

    const db = await this.getDatabase();
    const placeholders = keys.map((_, index) => `$key${index}`).join(', ');
    const params = Object.fromEntries(keys.map((key, index) => [`$key${index}`, key]));

    const rows = await db.getAllAsync<{ key: string; value: string }>(
      `
SELECT key, value
FROM app_settings
WHERE key IN (${placeholders})`,
      params,
    );

    const result = Object.fromEntries(keys.map((key) => [key, null])) as Record<
      string,
      string | null
    >;

    for (const row of rows) {
      result[row.key] = row.value;
    }

    return result;
  }
}
