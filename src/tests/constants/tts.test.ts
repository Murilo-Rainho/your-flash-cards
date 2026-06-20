import { describe, expect, it } from '@jest/globals';

import {
  DEFAULT_TTS_PLAYBACK_SPEED,
  resolveTtsPlaybackSpeedPreference,
  TTS_PLAYBACK_SPEEDS,
} from '@/constants/tts';

describe('tts playback speed constants', () => {
  it('uses fast as fallback for missing or invalid preference', () => {
    expect(resolveTtsPlaybackSpeedPreference(null)).toBe(DEFAULT_TTS_PLAYBACK_SPEED);
    expect(resolveTtsPlaybackSpeedPreference('')).toBe(DEFAULT_TTS_PLAYBACK_SPEED);
    expect(resolveTtsPlaybackSpeedPreference('normal')).toBe(DEFAULT_TTS_PLAYBACK_SPEED);
  });

  it('accepts valid preferences', () => {
    expect(resolveTtsPlaybackSpeedPreference(TTS_PLAYBACK_SPEEDS.FAST)).toBe(
      TTS_PLAYBACK_SPEEDS.FAST,
    );
    expect(resolveTtsPlaybackSpeedPreference(TTS_PLAYBACK_SPEEDS.SLOW)).toBe(
      TTS_PLAYBACK_SPEEDS.SLOW,
    );
  });
});
