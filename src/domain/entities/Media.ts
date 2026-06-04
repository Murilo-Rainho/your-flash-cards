export const MEDIA_SIDES = {
  FRONT: 'front',
  BACK: 'back',
} as const;

export const MEDIA_TYPES = {
  IMAGE: 'image',
  AUDIO: 'audio',
  RECORDING: 'recording',
  TTS: 'tts',
} as const;

export type MediaSide = (typeof MEDIA_SIDES)[keyof typeof MEDIA_SIDES];
export type MediaType = (typeof MEDIA_TYPES)[keyof typeof MEDIA_TYPES];

/**
 * Media local (§30.6), compartilhada pelo card fisico quando cardVariantId e
 * indefinido.
 */
export type Media = {
  id: string;
  cardId: string;
  cardVariantId?: string;
  side: MediaSide;
  type: MediaType;
  uri: string;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
};
