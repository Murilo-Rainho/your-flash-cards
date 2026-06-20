import { LISTENING_INPUT_MODES, type ListeningInputMode } from './listeningInputMode';

/**
 * Typing card FRONT content mode (§11).
 *
 * Unlike other types, Typing front is never text: always media the
 * reviewer consumes (audio, recording, TTS, or image). The user picks one of these modes and
 * types the expected answer on the back.
 */
export const TYPING_FRONT_MODES = {
  AUDIO_FILE: 'audio_file',
  RECORDING: 'recording',
  TTS: 'tts',
  IMAGE_CAMERA: 'image_camera',
  IMAGE_GALLERY: 'image_gallery',
} as const;

export type TypingFrontMode = (typeof TYPING_FRONT_MODES)[keyof typeof TYPING_FRONT_MODES];

/** True when front mode is an image (camera or gallery). */
export function isTypingImageMode(mode: TypingFrontMode): boolean {
  return mode === TYPING_FRONT_MODES.IMAGE_CAMERA || mode === TYPING_FRONT_MODES.IMAGE_GALLERY;
}

/**
 * Maps Typing front mode to the corresponding `ListeningInputMode`, reusing
 * existing audio/TTS plumbing (audio test, TTS materialization on submit). Image
 * modes have no audio but return a neutral value to keep state consistent.
 */
export function typingFrontModeToListeningMode(mode: TypingFrontMode): ListeningInputMode {
  switch (mode) {
    case TYPING_FRONT_MODES.RECORDING:
      return LISTENING_INPUT_MODES.RECORDING;
    case TYPING_FRONT_MODES.TTS:
      return LISTENING_INPUT_MODES.TTS;
    default:
      return LISTENING_INPUT_MODES.AUDIO_FILE;
  }
}
