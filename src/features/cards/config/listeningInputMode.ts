export const LISTENING_INPUT_MODES = {
  AUDIO_FILE: 'audio_file',
  RECORDING: 'recording',
  TTS: 'tts',
} as const;

export type ListeningInputMode = (typeof LISTENING_INPUT_MODES)[keyof typeof LISTENING_INPUT_MODES];

export const LISTENING_INPUT_MODE_OPTIONS = [
  {
    value: LISTENING_INPUT_MODES.AUDIO_FILE,
    label: 'Enviar arquivo de audio',
  },
  {
    value: LISTENING_INPUT_MODES.RECORDING,
    label: 'Gravar audio',
  },
  {
    value: LISTENING_INPUT_MODES.TTS,
    label: 'Texto para TTS na revisao',
  },
] as const;
