export const LISTENING_INPUT_MODES = {
  AUDIO_FILE: 'audio_file',
  RECORDING: 'recording',
  TTS: 'tts',
} as const;

export type ListeningInputMode = (typeof LISTENING_INPUT_MODES)[keyof typeof LISTENING_INPUT_MODES];
