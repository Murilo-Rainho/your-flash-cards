import { LISTENING_INPUT_MODES, type ListeningInputMode } from './listeningInputMode';

/**
 * Modo de conteúdo da FRENTE do card de Escrita (§11).
 *
 * Diferente dos demais tipos, a frente da Escrita nunca é texto: é sempre uma mídia que o
 * revisor consome (áudio, gravação, TTS ou imagem). O usuário escolhe um destes modos e
 * digita a resposta esperada no verso.
 */
export const TYPING_FRONT_MODES = {
  AUDIO_FILE: 'audio_file',
  RECORDING: 'recording',
  TTS: 'tts',
  IMAGE_CAMERA: 'image_camera',
  IMAGE_GALLERY: 'image_gallery',
} as const;

export type TypingFrontMode = (typeof TYPING_FRONT_MODES)[keyof typeof TYPING_FRONT_MODES];

export const TYPING_FRONT_MODE_OPTIONS = [
  {
    value: TYPING_FRONT_MODES.AUDIO_FILE,
    label: 'Enviar arquivo de audio',
  },
  {
    value: TYPING_FRONT_MODES.RECORDING,
    label: 'Gravar audio',
  },
  {
    value: TYPING_FRONT_MODES.TTS,
    label: 'Texto para TTS na revisao',
  },
  {
    value: TYPING_FRONT_MODES.IMAGE_CAMERA,
    label: 'Tirar foto com a camera',
  },
  {
    value: TYPING_FRONT_MODES.IMAGE_GALLERY,
    label: 'Escolher imagem da galeria',
  },
] as const;

/** True quando o modo da frente é uma imagem (câmera ou galeria). */
export function isTypingImageMode(mode: TypingFrontMode): boolean {
  return mode === TYPING_FRONT_MODES.IMAGE_CAMERA || mode === TYPING_FRONT_MODES.IMAGE_GALLERY;
}

/**
 * Mapeia o modo da frente da Escrita para o `ListeningInputMode` correspondente, reaproveitando
 * a plumbing de áudio/TTS já existente (teste de áudio, materialização do TTS no envio). Modos
 * de imagem não têm áudio, mas devolvem um valor neutro para manter o estado consistente.
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
