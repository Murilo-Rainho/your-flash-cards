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

const backTts: CreateCardMediaInput = {
  side: MEDIA_SIDES.BACK,
  type: MEDIA_TYPES.TTS,
  language: 'pt-BR',
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

  it('keeps only non-image front media for listening/typing', () => {
    const result = sanitizeMediaForType(CARD_TYPES.LISTENING, [frontImage, frontAudio, backTts]);
    expect(result).toEqual([frontAudio]);
  });

  it('keeps front audio and back TTS for pronunciation', () => {
    const result = sanitizeMediaForType(CARD_TYPES.PRONUNCIATION, [
      frontImage,
      frontAudio,
      backTts,
    ]);
    expect(result).toEqual([frontAudio, backTts]);
  });

  it('keeps everything for vocabulary', () => {
    const media = [frontImage, frontAudio, backTts];
    expect(sanitizeMediaForType(CARD_TYPES.VOCABULARY, media)).toEqual(media);
  });
});
