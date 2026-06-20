/**
 * App limits and default values.
 *
 * - `FREE_CARD_LIMIT: null` → local card creation is unlimited on Free (§4.1).
 * - `DEFAULT_REVIEW_SESSION_LIMIT` → cap on cards per review session; the query
 *   always uses `... ORDER BY next_review_at ASC LIMIT :sessionLimit` (§20).
 * - `DEFAULT_CARD_LIST_PAGE_SIZE` → local page size for the card list (§29.1).
 * - `MAX_TAGS` / `MAX_TAG_LENGTH` → per-card tag count and per-tag length limits (§6).
 */
export const LIMITS = {
  FREE_CARD_LIMIT: null,
  DEFAULT_REVIEW_SESSION_LIMIT: 20,
  DEFAULT_CARD_LIST_PAGE_SIZE: 30,
  MAX_TAGS: 20,
  MAX_TAG_LENGTH: 32,
} as const;

export type Limits = typeof LIMITS;
