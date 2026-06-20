import { describe, expect, it } from '@jest/globals';

import * as Speech from 'expo-speech';

import { TTS_PLAYBACK_SPEEDS } from '@/constants/tts';

import { ExpoSpeechTtsProvider } from '@/infrastructure/tts/ExpoSpeechTtsProvider';

jest.mock('expo-speech', () => ({
  getAvailableVoicesAsync: jest.fn(),
  speak: jest.fn(),
  stop: jest.fn(),
}));

const getAvailableVoicesAsync = Speech.getAvailableVoicesAsync as jest.MockedFunction<
  typeof Speech.getAvailableVoicesAsync
>;
const speak = Speech.speak as jest.MockedFunction<typeof Speech.speak>;
const stop = Speech.stop as jest.MockedFunction<typeof Speech.stop>;

function mockAvailableEnglishVoice(): void {
  getAvailableVoicesAsync.mockResolvedValue([
    { identifier: 'voice-1', name: 'English', quality: 'Default', language: 'en-US' },
  ] as Awaited<ReturnType<typeof Speech.getAvailableVoicesAsync>>);
}

describe('ExpoSpeechTtsProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAvailableEnglishVoice();
    stop.mockResolvedValue(undefined);
    speak.mockImplementation((_text, options) => {
      options?.onDone?.();
    });
  });

  it('uses fast speed by default', async () => {
    const provider = new ExpoSpeechTtsProvider();

    await provider.speak({ text: 'hello', language: 'en-US' });

    expect(speak).toHaveBeenCalledWith(
      'hello',
      expect.objectContaining({ language: 'en-US', rate: 1 }),
    );
  });

  it('maps slow to rate 0.5', async () => {
    const provider = new ExpoSpeechTtsProvider();

    await provider.speak({
      text: 'hello',
      language: 'en-US',
      speed: TTS_PLAYBACK_SPEEDS.SLOW,
    });

    expect(speak).toHaveBeenCalledWith(
      'hello',
      expect.objectContaining({ language: 'en-US', rate: 0.5 }),
    );
  });
});
