import { useMemo } from 'react';

import { getExpoSpeechTtsProvider } from '@/infrastructure/tts/ExpoSpeechTtsProvider';

export type CardTts = {
  isAvailable: (language: string) => Promise<boolean>;
  speak: (text: string, language: string) => Promise<void>;
};

/** Acesso ao TTS local (injeção da infraestrutura na borda da feature). */
export function useCardTts(): CardTts {
  const ttsProvider = useMemo(() => getExpoSpeechTtsProvider(), []);

  return useMemo(
    () => ({
      isAvailable: (language: string) => ttsProvider.isAvailable({ language }),
      speak: (text: string, language: string) => ttsProvider.speak({ text, language }),
    }),
    [ttsProvider],
  );
}
