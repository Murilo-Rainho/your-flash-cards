/**
 * V1 card types (§7–§12). Exactly these five — do not invent others.
 * The value is the stable identifier used in storage/CSV (§24 uses `vocabulary`).
 */
export const CARD_TYPES = {
  VOCABULARY: 'vocabulary',
  CLOZE: 'cloze',
  LISTENING: 'listening',
  TYPING: 'typing',
  PRONUNCIATION: 'pronunciation',
} as const;

export type CardType = (typeof CARD_TYPES)[keyof typeof CARD_TYPES];
