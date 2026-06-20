import { CARD_TYPES, type CardType } from '@/constants/cardTypes';
import { MEDIA_SIDES, MEDIA_TYPES } from '@/domain/entities/Media';

import type { CreateCardMediaInput } from './createCard';

/** Groups a media type into "image" or "audio" for per-side replacement. */
export function mediaGroup(type: CreateCardMediaInput['type']): 'image' | 'audio' {
  return type === MEDIA_TYPES.IMAGE ? 'image' : 'audio';
}

/** Friendly label for a media item shown in the UI. */
export function getMediaLabel(item: CreateCardMediaInput): string {
  if (item.type === MEDIA_TYPES.TTS) {
    return `TTS ${item.language}`;
  }

  return item.fileName ?? item.uri.split('/').pop() ?? item.type;
}

/** Removes media incompatible with the selected card type. */
export function sanitizeMediaForType(
  type: CardType,
  media: readonly CreateCardMediaInput[],
): CreateCardMediaInput[] {
  if (type === CARD_TYPES.CLOZE) {
    return [];
  }

  if (type === CARD_TYPES.VOCABULARY) {
    // Front accepts image or audio; back is text only.
    return media.filter((item) => item.side === MEDIA_SIDES.FRONT);
  }

  if (type === CARD_TYPES.LISTENING) {
    // Audio/TTS on front only; back uses text only (transcript).
    return media.filter(
      (item) => item.side === MEDIA_SIDES.FRONT && item.type !== MEDIA_TYPES.IMAGE,
    );
  }

  if (type === CARD_TYPES.PRONUNCIATION) {
    // Inverse of Listening: text on front; model audio/TTS on back.
    return media.filter(
      (item) => item.side === MEDIA_SIDES.BACK && item.type !== MEDIA_TYPES.IMAGE,
    );
  }

  if (type === CARD_TYPES.TYPING) {
    // Front accepts audio/recording/TTS or image; back is the typed answer only.
    return media.filter((item) => item.side === MEDIA_SIDES.FRONT);
  }

  return [...media];
}
