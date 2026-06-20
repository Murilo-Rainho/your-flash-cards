/**
 * App environment variables.
 *
 * Minimal structure for future variable reads. Does NOT introduce backend dependency
 * (offline-first, §29). Premium/remote will be treated as an extension point.
 */
export const env = {
  APP_ENV: 'development',
} as const;

export type AppEnv = typeof env;
