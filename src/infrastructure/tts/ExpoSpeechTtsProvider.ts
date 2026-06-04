import * as Speech from 'expo-speech';

import type {
  TtsAvailabilityInput,
  TtsProvider,
  TtsSpeakInput,
} from '@/domain/services/TtsProvider';

function normalizeLanguage(value: string): string {
  return value.trim().toLowerCase();
}

function voiceMatchesLanguage(voiceLanguage: string, requestedLanguage: string): boolean {
  const voice = normalizeLanguage(voiceLanguage);
  const requested = normalizeLanguage(requestedLanguage);
  const requestedBase = requested.split('-')[0] ?? requested;
  const voiceBase = voice.split('-')[0] ?? voice;

  return voice === requested || voiceBase === requestedBase;
}

export class ExpoSpeechTtsProvider implements TtsProvider {
  async isAvailable(input: TtsAvailabilityInput): Promise<boolean> {
    const language = normalizeLanguage(input.language);

    if (!language) {
      return false;
    }

    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.some((voice) => voiceMatchesLanguage(voice.language, language));
    } catch {
      return false;
    }
  }

  async speak(input: TtsSpeakInput): Promise<void> {
    const text = input.text.trim();
    const language = input.language.trim();

    if (!text || !(await this.isAvailable({ language }))) {
      throw new Error('TTS local indisponivel para este idioma.');
    }

    await Speech.stop();

    await new Promise<void>((resolve, reject) => {
      Speech.speak(text, {
        language,
        onDone: resolve,
        onStopped: resolve,
        onError: reject,
      });
    });
  }
}

let ttsProvider: TtsProvider | null = null;

export function getExpoSpeechTtsProvider(): TtsProvider {
  if (!ttsProvider) {
    ttsProvider = new ExpoSpeechTtsProvider();
  }

  return ttsProvider;
}
