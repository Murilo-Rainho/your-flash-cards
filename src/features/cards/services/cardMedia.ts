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

/** Remove mídias incompatíveis com o tipo de card selecionado. */
export function sanitizeMediaForType(
  type: CardType,
  media: readonly CreateCardMediaInput[],
): CreateCardMediaInput[] {
  if (type === CARD_TYPES.CLOZE) {
    return [];
  }

  if (type === CARD_TYPES.VOCABULARY) {
    // Frente aceita imagem ou áudio; verso é apenas texto.
    return media.filter((item) => item.side === MEDIA_SIDES.FRONT);
  }

  if (type === CARD_TYPES.LISTENING || type === CARD_TYPES.PRONUNCIATION) {
    // Áudio/TTS apenas na frente; verso não é usado na criação.
    return media.filter(
      (item) => item.side === MEDIA_SIDES.FRONT && item.type !== MEDIA_TYPES.IMAGE,
    );
  }

  if (type === CARD_TYPES.TYPING) {
    return media.filter(
      (item) => item.side === MEDIA_SIDES.FRONT && item.type !== MEDIA_TYPES.IMAGE,
    );
  }

  return [...media];
}
