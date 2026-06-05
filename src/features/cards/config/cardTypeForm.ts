import { CARD_TYPES, type CardType } from '@/constants/cardTypes';

/**
 * Capacidades de mídia de um lado do card (frente/verso) na UI de criação.
 * Espelha o que o serviço `createCard` aceita por tipo, sem duplicar a validação.
 */
export type SideMediaCapabilities = {
  allowImage: boolean;
  allowAudioFile: boolean;
  allowRecording: boolean;
  allowTts: boolean;
};

export type CardSideConfig = {
  showText: boolean;
  textPlaceholder: string;
  media: SideMediaCapabilities | null;
};

/** Layout do formulário de conteúdo por tipo de card. */
export type CardTypeLayout =
  | 'cloze'
  | 'standard'
  | 'pronunciation'
  | 'listening'
  | 'vocabulary'
  | 'typing';

export type CardTypeFormConfig = {
  type: CardType;
  label: string;
  description: string;
  recommended: boolean;
  layout: CardTypeLayout;
  front: CardSideConfig;
  back: CardSideConfig;
};

const ALL_MEDIA: SideMediaCapabilities = {
  allowImage: true,
  allowAudioFile: true,
  allowRecording: true,
  allowTts: true,
};

const AUDIO_AND_TTS_MEDIA: SideMediaCapabilities = {
  allowImage: false,
  allowAudioFile: true,
  allowRecording: true,
  allowTts: true,
};

/**
 * Fonte única de metadados/capacidades por tipo de card, consumida tanto pela lista de
 * seleção (etapa 1) quanto pelo render do conteúdo (etapa 2).
 */
export const CARD_TYPE_FORM_CONFIGS: readonly CardTypeFormConfig[] = [
  {
    type: CARD_TYPES.CLOZE,
    label: 'Preencher lacuna',
    description: 'Frase com lacuna manual',
    recommended: true,
    layout: 'cloze',
    front: { showText: false, textPlaceholder: '', media: null },
    back: { showText: true, textPlaceholder: "I'm tired now", media: null },
  },
  {
    type: CARD_TYPES.VOCABULARY,
    label: 'Vocabulario',
    description: 'Texto, imagem ou audio na frente',
    recommended: false,
    layout: 'vocabulary',
    front: { showText: true, textPlaceholder: 'apple', media: ALL_MEDIA },
    back: { showText: true, textPlaceholder: 'maca', media: null },
  },
  {
    type: CARD_TYPES.LISTENING,
    label: 'Escuta',
    description: 'Ouca o audio e escreva ou repita a frase',
    recommended: false,
    layout: 'listening',
    front: { showText: false, textPlaceholder: 'Frase que sera falada (TTS)', media: null },
    back: { showText: false, textPlaceholder: 'Escreva a frase do audio', media: null },
  },
  {
    type: CARD_TYPES.TYPING,
    label: 'Escrita',
    description: 'Audio ou imagem na frente, resposta digitada',
    recommended: false,
    layout: 'typing',
    // A frente é sempre mídia (áudio/gravação/TTS/imagem); o texto da frente só existe como
    // fonte do TTS. O verso é a resposta esperada (texto), comparada com o que for digitado.
    front: { showText: false, textPlaceholder: 'Texto que sera falado (TTS)', media: null },
    back: {
      showText: true,
      textPlaceholder: "Resposta esperada (ex.: I'm tired now)",
      media: null,
    },
  },
  {
    type: CARD_TYPES.PRONUNCIATION,
    label: 'Pronuncia',
    description: 'Texto na frente, audio modelo no verso',
    recommended: false,
    layout: 'pronunciation',
    front: {
      showText: true,
      textPlaceholder: "Texto para pronunciar (ex.: I'm tired now)",
      media: null,
    },
    back: {
      showText: false,
      textPlaceholder: 'Texto que sera falado (TTS)',
      media: AUDIO_AND_TTS_MEDIA,
    },
  },
];

export function getCardTypeFormConfig(type: CardType): CardTypeFormConfig {
  return CARD_TYPE_FORM_CONFIGS.find((config) => config.type === type) ?? CARD_TYPE_FORM_CONFIGS[0];
}
