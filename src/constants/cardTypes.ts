/**
 * Tipos de card da V1 (§7–§12). São exatamente estes cinco — não inventar outros.
 * O valor é o identificador estável usado em storage/CSV (§24 usa `vocabulary`).
 */
export const CARD_TYPES = {
  VOCABULARY: 'vocabulary',
  CLOZE: 'cloze',
  LISTENING: 'listening',
  TYPING: 'typing',
  PRONUNCIATION: 'pronunciation',
} as const;

export type CardType = (typeof CARD_TYPES)[keyof typeof CARD_TYPES];
