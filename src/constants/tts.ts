export const TTS_PLAYBACK_SPEEDS = {
  FAST: 'fast',
  SLOW: 'slow',
} as const;

export type TtsPlaybackSpeed = (typeof TTS_PLAYBACK_SPEEDS)[keyof typeof TTS_PLAYBACK_SPEEDS];

export const DEFAULT_TTS_PLAYBACK_SPEED: TtsPlaybackSpeed = TTS_PLAYBACK_SPEEDS.FAST;

export const TTS_PLAYBACK_RATES: Record<TtsPlaybackSpeed, number> = {
  [TTS_PLAYBACK_SPEEDS.FAST]: 1,
  [TTS_PLAYBACK_SPEEDS.SLOW]: 0.5,
};

export function isTtsPlaybackSpeed(value: string): value is TtsPlaybackSpeed {
  return (Object.values(TTS_PLAYBACK_SPEEDS) as string[]).includes(value);
}

export function resolveTtsPlaybackSpeedPreference(
  value: string | null | undefined,
): TtsPlaybackSpeed {
  return value && isTtsPlaybackSpeed(value) ? value : DEFAULT_TTS_PLAYBACK_SPEED;
}
