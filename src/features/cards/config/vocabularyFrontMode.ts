export const VOCABULARY_FRONT_MODES = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
} as const;

export type VocabularyFrontMode =
  (typeof VOCABULARY_FRONT_MODES)[keyof typeof VOCABULARY_FRONT_MODES];
