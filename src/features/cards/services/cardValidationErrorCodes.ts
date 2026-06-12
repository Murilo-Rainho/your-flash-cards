export const CARD_FIELD_ERROR_CODES = {
  clozeNoBlanks: 'clozeNoBlanks',
  clozeBlankWithoutAnswer: 'clozeBlankWithoutAnswer',
  clozeTextOnly: 'clozeTextOnly',
} as const;

export type CardFieldErrorCode =
  (typeof CARD_FIELD_ERROR_CODES)[keyof typeof CARD_FIELD_ERROR_CODES];
