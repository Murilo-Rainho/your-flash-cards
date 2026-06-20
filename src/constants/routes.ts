/**
 * V1 screen route names/paths (§33), centralized to avoid scattered strings.
 * Concrete routes (expo-router) live in `src/app/` and will be created in future
 * steps — only constants live here.
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
  REVIEW_TODAY: '/review/today',
  STATS: '/stats',
  SETTINGS: '/settings',
  WHY_FLASHCARDS: '/why-flashcards',
  DEV_TOOLS: '/dev-tools',
  DEV_TOOLS_TABLE: '/dev-tools/tables/[name]',
  PREMIUM: '/premium',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

type NewCardRouteParams = {
  collectionId?: string;
  deckId?: string;
};

/** Helpers to build `pathname` + `params` for dynamic routes (expo-router). */
export const routeHrefs = {
  cardNew: (params: NewCardRouteParams = {}) => ({ pathname: ROUTES.CARD_NEW, params }),
  collectionDetail: (id: string) => ({ pathname: ROUTES.COLLECTION_DETAIL, params: { id } }),
  deckDetail: (id: string) => ({ pathname: ROUTES.DECK_DETAIL, params: { id } }),
  cardDetail: (id: string) => ({ pathname: ROUTES.CARD_DETAIL, params: { id } }),
  devToolsTable: (name: string) => ({ pathname: ROUTES.DEV_TOOLS_TABLE, params: { name } }),
} as const;
