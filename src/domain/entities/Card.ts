import type { CardType } from '@/constants/cardTypes';
import type { ClozeContent } from '@/domain/cloze/clozeContent';

/**
 * Physical card (§30.4). Derived variants define presentation; authored content remains the
 * source of truth here.
 */
export type Card = {
  id: string;
  deckId: string;
  type: CardType;
  front: string;
  back: string;
  /**
   * Structured cloze content (§9): multiple blanks and multiple accepted answers per blank.
   * Source of truth for `cloze` cards; `front`/`back` are derived from it. Absent on other
   * types and legacy cloze cards (rebuilt via `clozeContentFromLegacy`).
   */
  cloze?: ClozeContent;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
};
