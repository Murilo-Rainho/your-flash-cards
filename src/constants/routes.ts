/**
 * Nomes/paths de rota das telas da V1 (§33), centralizados para evitar strings
 * soltas. As rotas concretas (expo-router) ficam em `src/app/` e serão criadas
 * em etapas futuras — aqui ficam apenas as constantes.
 */
export const ROUTES = {
  ONBOARDING: '/onboarding',
  HOME: '/',
  COLLECTIONS: '/collections',
  DECKS: '/decks',
  CARDS: '/cards',
  IMPORT: '/import',
  EXPORT: '/export',
  REVIEW: '/review',
  REVIEW_RESULT: '/review/result',
  STATS: '/stats',
  SETTINGS: '/settings',
  PREMIUM: '/premium',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
