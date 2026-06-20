/**
 * Global app constants.
 *
 * Note (§4.1): the Free plan does NOT cap card count — the user may create as
 * many cards as they want locally. Hence there is no `cardLimitFree`: local card
 * creation is unlimited.
 */
export const appConfig = {
  appName: 'Flashcards',
  version: '1.0.0',
} as const;

export type AppConfig = typeof appConfig;
