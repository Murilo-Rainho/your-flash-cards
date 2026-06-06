/**
 * Nomes/paths de rota das telas da V1 (§33), centralizados para evitar strings
 * soltas. As rotas concretas (expo-router) ficam em `src/app/` e serão criadas
 * em etapas futuras — aqui ficam apenas as constantes.
 */
export const ROUTES = {
  ONBOARDING: '/onboarding',
  HOME: '/',
  COLLECTIONS: '/collections',
  COLLECTION_NEW: '/collections/new',
  COLLECTION_DETAIL: '/collections/[id]',
  DECKS: '/decks',
  DECK_NEW: '/decks/new',
  DECK_DETAIL: '/decks/[id]',
  CARDS: '/cards',
  CARD_NEW: '/cards/new',
  CARD_DETAIL: '/cards/[id]',
  IMPORT: '/import',
  EXPORT: '/export',
  REVIEW: '/review',
  REVIEW_RESULT: '/review/result',
  STATS: '/stats',
  SETTINGS: '/settings',
  PREMIUM: '/premium',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

/** Helpers para montar `pathname` + `params` das rotas dinâmicas (expo-router). */
export const routeHrefs = {
  collectionDetail: (id: string) => ({ pathname: ROUTES.COLLECTION_DETAIL, params: { id } }),
  deckDetail: (id: string) => ({ pathname: ROUTES.DECK_DETAIL, params: { id } }),
  cardDetail: (id: string) => ({ pathname: ROUTES.CARD_DETAIL, params: { id } }),
} as const;
