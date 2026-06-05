/**
 * Porta de leitura/escrita de preferências locais (KV em `app_settings`).
 *
 * Implementações concretas usam SQLite; features dependem apenas deste contrato.
 */
export type AppSettingsRepository = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  getMany(keys: readonly string[]): Promise<Record<string, string | null>>;
};
