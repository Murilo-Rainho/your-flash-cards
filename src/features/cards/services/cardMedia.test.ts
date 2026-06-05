import { CARD_TYPES } from '@/constants/cardTypes';
import { MEDIA_SIDES, MEDIA_TYPES } from '@/domain/entities/Media';

import { getMediaLabel, mediaGroup, sanitizeMediaForType } from './cardMedia';
import type { CreateCardMediaInput } from './createCard';

const frontImage: CreateCardMediaInput = {
  side: MEDIA_SIDES.FRONT,
  type: MEDIA_TYPES.IMAGE,
  uri: 'file:///front.png',
  mimeType: 'image/png',
  fileName: 'front.png',
};

const frontAudio: CreateCardMediaInput = {
  side: MEDIA_SIDES.FRONT,
  type: MEDIA_TYPES.AUDIO,
  uri: 'file:///front.mp3',
  mimeType: 'audio/mpeg',
};

const backAudio: CreateCardMediaInput = {
  side: MEDIA_SIDES.BACK,
  type: MEDIA_TYPES.AUDIO,
  uri: 'file:///back.mp3',
  mimeType: 'audio/mpeg',
  fileName: 'back.mp3',
};

const backTts: CreateCardMediaInput = {
  side: MEDIA_SIDES.BACK,
  type: MEDIA_TYPES.TTS,
  language: 'pt-BR',
};

const frontTts: CreateCardMediaInput = {
  side: MEDIA_SIDES.FRONT,
  type: MEDIA_TYPES.TTS,
  language: 'en-US',
};

describe('mediaGroup', () => {
  it('classifies image vs audio-like types', () => {
    expect(mediaGroup(MEDIA_TYPES.IMAGE)).toBe('image');
    expect(mediaGroup(MEDIA_TYPES.AUDIO)).toBe('audio');
    expect(mediaGroup(MEDIA_TYPES.RECORDING)).toBe('audio');
    expect(mediaGroup(MEDIA_TYPES.TTS)).toBe('audio');
  });
});

describe('getMediaLabel', () => {
  it('labels TTS with the language', () => {
    expect(getMediaLabel(backTts)).toBe('TTS pt-BR');
  });

  it('prefers fileName, then the last path segment', () => {
    expect(getMediaLabel(frontImage)).toBe('front.png');
    expect(getMediaLabel(frontAudio)).toBe('front.mp3');
  });
});

describe('sanitizeMediaForType', () => {
  it('drops all media for cloze', () => {
    expect(sanitizeMediaForType(CARD_TYPES.CLOZE, [frontImage, frontAudio])).toEqual([]);
  });

  it('keeps only non-image front media for listening', () => {
    const result = sanitizeMediaForType(CARD_TYPES.LISTENING, [frontImage, frontAudio, backTts]);
    expect(result).toEqual([frontAudio]);
  });

  it('keeps front media (image or audio) and drops back media for typing', () => {
    const result = sanitizeMediaForType(CARD_TYPES.TYPING, [frontImage, frontAudio, backTts]);
    expect(result).toEqual([frontImage, frontAudio]);
  });

  it('keeps only non-image back media (audio or TTS) for pronunciation', () => {
    const result = sanitizeMediaForType(CARD_TYPES.PRONUNCIATION, [
      frontImage,
      frontAudio,
      frontTts,
      backAudio,
      backTts,
    ]);
    expect(result).toEqual([backAudio, backTts]);
  });

  it('keeps only front media for vocabulary', () => {
    const result = sanitizeMediaForType(CARD_TYPES.VOCABULARY, [frontImage, frontAudio, backTts]);
    expect(result).toEqual([frontImage, frontAudio]);
  });
});
