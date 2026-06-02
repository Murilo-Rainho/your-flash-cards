/**
 * Limites e valores padrão do app.
 *
 * - `FREE_CARD_LIMIT: null` → criação local de cards é ilimitada no Free (§4.1).
 * - `DEFAULT_REVIEW_SESSION_LIMIT` → teto de cards por sessão de revisão; a query
 *   sempre usa `... ORDER BY next_review_at ASC LIMIT :sessionLimit` (§20).
 */
export const LIMITS = {
  FREE_CARD_LIMIT: null,
  DEFAULT_REVIEW_SESSION_LIMIT: 20,
} as const;

export type Limits = typeof LIMITS;
