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

  if (type === CARD_TYPES.LISTENING) {
    // Áudio/TTS apenas na frente; o verso usa apenas texto (transcrição).
    return media.filter(
      (item) => item.side === MEDIA_SIDES.FRONT && item.type !== MEDIA_TYPES.IMAGE,
    );
  }

  if (type === CARD_TYPES.PRONUNCIATION) {
    // Inverso da Escuta: o texto fica na frente; o áudio/TTS modelo fica no verso.
    return media.filter(
      (item) => item.side === MEDIA_SIDES.BACK && item.type !== MEDIA_TYPES.IMAGE,
    );
  }

  if (type === CARD_TYPES.TYPING) {
    // Frente aceita áudio/gravação/TTS ou imagem; o verso é apenas a resposta digitada.
    return media.filter((item) => item.side === MEDIA_SIDES.FRONT);
  }

  return [...media];
}
