/**
 * Read/write port for local preferences (KV in `app_settings`).
 *
 * Concrete implementations use SQLite; features depend only on this contract.
 */
export type AppSettingsRepository = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  getMany(keys: readonly string[]): Promise<Record<string, string | null>>;
};
