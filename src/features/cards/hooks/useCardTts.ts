import { useMemo } from 'react';

import type { TtsPlaybackSpeed } from '@/constants/tts';
import { getExpoSpeechTtsProvider } from '@/infrastructure/tts/ExpoSpeechTtsProvider';

export type CardTts = {
  isAvailable: (language: string) => Promise<boolean>;
  speak: (text: string, language: string, speed?: TtsPlaybackSpeed) => Promise<void>;
};

/** Acesso ao TTS local (injeção da infraestrutura na borda da feature). */
export function useCardTts(): CardTts {
  const ttsProvider = useMemo(() => getExpoSpeechTtsProvider(), []);

  return useMemo(
    () => ({
      isAvailable: (language: string) => ttsProvider.isAvailable({ language }),
      speak: (text: string, language: string, speed?: TtsPlaybackSpeed) =>
        ttsProvider.speak({ text, language, speed }),
    }),
    [ttsProvider],
  );
}
