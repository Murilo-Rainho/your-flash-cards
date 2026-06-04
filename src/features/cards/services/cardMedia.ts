import { CARD_TYPES, type CardType } from '@/constants/cardTypes';
import { MEDIA_SIDES, MEDIA_TYPES } from '@/domain/entities/Media';

import type { CreateCardMediaInput } from './createCard';

/** Agrupa um tipo de mídia em "image" ou "audio" para substituição por lado. */
export function mediaGroup(type: CreateCardMediaInput['type']): 'image' | 'audio' {
  return type === MEDIA_TYPES.IMAGE ? 'image' : 'audio';
}

/** Rótulo amigável de uma mídia para exibição na UI. */
export function getMediaLabel(item: CreateCardMediaInput): string {
  if (item.type === MEDIA_TYPES.TTS) {
    return `TTS ${item.language}`;
  }

  return item.fileName ?? item.uri.split('/').pop() ?? item.type;
}

function isFrontAudioForPronunciation(item: CreateCardMediaInput): boolean {
  return (
    item.side === MEDIA_SIDES.FRONT &&
    (item.type === MEDIA_TYPES.AUDIO || item.type === MEDIA_TYPES.RECORDING)
  );
}

/** Remove mídias incompatíveis com o tipo de card selecionado. */
export function sanitizeMediaForType(
  type: CardType,
  media: readonly CreateCardMediaInput[],
): CreateCardMediaInput[] {
  if (type === CARD_TYPES.CLOZE) {
    return [];
  }

  if (type === CARD_TYPES.LISTENING) {
    return media.filter((item) => item.type !== MEDIA_TYPES.IMAGE);
  }

  if (type === CARD_TYPES.TYPING) {
    return media.filter(
      (item) => item.side === MEDIA_SIDES.FRONT && item.type !== MEDIA_TYPES.IMAGE,
    );
  }

  if (type === CARD_TYPES.PRONUNCIATION) {
    return media.filter(
      (item) =>
        isFrontAudioForPronunciation(item) ||
        (item.side === MEDIA_SIDES.BACK && item.type === MEDIA_TYPES.TTS),
    );
  }

  return [...media];
}
