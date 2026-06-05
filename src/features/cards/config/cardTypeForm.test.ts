import { CARD_TYPES } from '@/constants/cardTypes';

import { CARD_TYPE_FORM_CONFIGS, getCardTypeFormConfig } from './cardTypeForm';

describe('cardTypeForm config', () => {
  it('has exactly the five V1 card types', () => {
    const types = CARD_TYPE_FORM_CONFIGS.map((config) => config.type).sort();
    expect(types).toEqual([...Object.values(CARD_TYPES)].sort());
  });

  it('marks cloze as recommended and uses the cloze layout', () => {
    const cloze = getCardTypeFormConfig(CARD_TYPES.CLOZE);
    expect(cloze.recommended).toBe(true);
    expect(cloze.layout).toBe('cloze');
    expect(cloze.front.media).toBeNull();
    expect(cloze.back.media).toBeNull();
  });

  it('uses the listening layout without inline media controls', () => {
    const config = getCardTypeFormConfig(CARD_TYPES.LISTENING);
    expect(config.layout).toBe('listening');
    expect(config.front.media).toBeNull();
    expect(config.back.media).toBeNull();
  });

  it('uses the typing layout: media front and text-only back', () => {
    const config = getCardTypeFormConfig(CARD_TYPES.TYPING);
    expect(config.layout).toBe('typing');
    expect(config.front.showText).toBe(false);
    expect(config.front.media).toBeNull();
    expect(config.back.showText).toBe(true);
    expect(config.back.media).toBeNull();
  });

  it('pronunciation shows front text and allows audio/TTS on the back', () => {
    const config = getCardTypeFormConfig(CARD_TYPES.PRONUNCIATION);
    expect(config.layout).toBe('pronunciation');
    expect(config.front.showText).toBe(true);
    expect(config.front.media).toBeNull();
    expect(config.back.showText).toBe(false);
    expect(config.back.media).toEqual({
      allowImage: false,
      allowAudioFile: true,
      allowRecording: true,
      allowTts: true,
    });
  });

  it('uses the vocabulary layout with a text-only back', () => {
    const config = getCardTypeFormConfig(CARD_TYPES.VOCABULARY);
    expect(config.layout).toBe('vocabulary');
    expect(config.back.showText).toBe(true);
    expect(config.back.media).toBeNull();
  });
});
