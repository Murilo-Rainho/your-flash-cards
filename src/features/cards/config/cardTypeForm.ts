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
export type CardTypeLayout = 'cloze' | 'standard' | 'pronunciation' | 'listening';

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

const AUDIO_ONLY_MEDIA: SideMediaCapabilities = {
  allowImage: false,
  allowAudioFile: true,
  allowRecording: true,
  allowTts: false,
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
    description: 'Frente e verso simples',
    recommended: false,
    layout: 'standard',
    front: { showText: true, textPlaceholder: 'apple', media: ALL_MEDIA },
    back: { showText: true, textPlaceholder: 'maca', media: ALL_MEDIA },
  },
  {
    type: CARD_TYPES.LISTENING,
    label: 'Escuta',
    description: 'Audio na frente e no verso',
    recommended: false,
    layout: 'listening',
    front: { showText: false, textPlaceholder: 'Texto para ouvir na revisao', media: null },
    back: { showText: false, textPlaceholder: 'Texto para ouvir na revisao', media: null },
  },
  {
    type: CARD_TYPES.TYPING,
    label: 'Escrita',
    description: 'Resposta digitada',
    recommended: false,
    layout: 'standard',
    front: { showText: true, textPlaceholder: 'Estou cansado agora.', media: AUDIO_AND_TTS_MEDIA },
    back: { showText: true, textPlaceholder: "I'm tired now.", media: null },
  },
  {
    type: CARD_TYPES.PRONUNCIATION,
    label: 'Pronuncia',
    description: 'Audio e TTS local',
    recommended: false,
    layout: 'pronunciation',
    front: { showText: false, textPlaceholder: '', media: AUDIO_ONLY_MEDIA },
    back: { showText: true, textPlaceholder: "I'm tired now", media: null },
  },
];

export function getCardTypeFormConfig(type: CardType): CardTypeFormConfig {
  return CARD_TYPE_FORM_CONFIGS.find((config) => config.type === type) ?? CARD_TYPE_FORM_CONFIGS[0];
}
