import { describe, expect, it } from '@jest/globals';

import {
  DEFAULT_TTS_PLAYBACK_SPEED,
  resolveTtsPlaybackSpeedPreference,
  TTS_PLAYBACK_SPEEDS,
} from './tts';

describe('tts playback speed constants', () => {
  it('usa fast como fallback para preferencia ausente ou invalida', () => {
    expect(resolveTtsPlaybackSpeedPreference(null)).toBe(DEFAULT_TTS_PLAYBACK_SPEED);
    expect(resolveTtsPlaybackSpeedPreference('')).toBe(DEFAULT_TTS_PLAYBACK_SPEED);
    expect(resolveTtsPlaybackSpeedPreference('normal')).toBe(DEFAULT_TTS_PLAYBACK_SPEED);
  });

  it('aceita preferencias validas', () => {
    expect(resolveTtsPlaybackSpeedPreference(TTS_PLAYBACK_SPEEDS.FAST)).toBe(
      TTS_PLAYBACK_SPEEDS.FAST,
    );
    expect(resolveTtsPlaybackSpeedPreference(TTS_PLAYBACK_SPEEDS.SLOW)).toBe(
      TTS_PLAYBACK_SPEEDS.SLOW,
    );
  });
});
