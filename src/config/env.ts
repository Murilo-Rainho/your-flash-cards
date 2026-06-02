/**
 * Variáveis de ambiente do app.
 *
 * Estrutura mínima para leitura futura de variáveis. NÃO introduz dependência de
 * backend (offline-first, §29). Premium/remoto será tratado como ponto de extensão.
 */
export const env = {
  APP_ENV: 'development',
} as const;

export type AppEnv = typeof env;
