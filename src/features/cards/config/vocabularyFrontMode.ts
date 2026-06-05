export const VOCABULARY_FRONT_MODES = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
} as const;

export type VocabularyFrontMode =
  (typeof VOCABULARY_FRONT_MODES)[keyof typeof VOCABULARY_FRONT_MODES];

export const VOCABULARY_FRONT_MODE_OPTIONS = [
  {
    value: VOCABULARY_FRONT_MODES.TEXT,
    label: 'Texto simples',
  },
  {
    value: VOCABULARY_FRONT_MODES.IMAGE,
    label: 'Imagem',
  },
  {
    value: VOCABULARY_FRONT_MODES.AUDIO,
    label: 'Audio',
  },
] as const;
