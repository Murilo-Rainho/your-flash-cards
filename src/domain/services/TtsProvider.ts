import type { TtsPlaybackSpeed } from '@/constants/tts';

export type TtsAvailabilityInput = {
  language: string;
};

export type TtsSpeakInput = {
  text: string;
  language: string;
  speed?: TtsPlaybackSpeed;
};

export type TtsProvider = {
  isAvailable(input: TtsAvailabilityInput): Promise<boolean>;
  speak(input: TtsSpeakInput): Promise<void>;
};
