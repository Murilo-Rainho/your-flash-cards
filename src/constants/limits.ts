/**
 * Limites e valores padrão do app.
 *
 * - `FREE_CARD_LIMIT: null` → criação local de cards é ilimitada no Free (§4.1).
 * - `DEFAULT_REVIEW_SESSION_LIMIT` → teto de cards por sessão de revisão; a query
 *   sempre usa `... ORDER BY next_review_at ASC LIMIT :sessionLimit` (§20).
 * - `DEFAULT_CARD_LIST_PAGE_SIZE` → tamanho da página local da listagem de cards (§29.1).
 * - `MAX_TAGS` / `MAX_TAG_LENGTH` → limites de tags por card e de tamanho de cada tag (§6).
 */
export const LIMITS = {
  FREE_CARD_LIMIT: null,
  DEFAULT_REVIEW_SESSION_LIMIT: 20,
  DEFAULT_CARD_LIST_PAGE_SIZE: 30,
  MAX_TAGS: 20,
  MAX_TAG_LENGTH: 32,
} as const;

export type Limits = typeof LIMITS;
