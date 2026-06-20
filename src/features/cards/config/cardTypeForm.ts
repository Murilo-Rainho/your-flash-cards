import { CARD_TYPES, type CardType } from '@/constants/cardTypes';
import type { StringCatalog } from '@/strings/types';

/**
 * Media capabilities for one card side (front/back) in the creation UI.
 * Mirrors what `createCard` accepts per type without duplicating validation.
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

/** Content form layout per card type. */
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
 * Single source of metadata/capabilities per card type, consumed by both the
 * selection list (step 1) and content render (step 2).
 */
export function buildCardTypeFormConfigs(
  cardStrings: StringCatalog['cards']['cardTypes'],
): readonly CardTypeFormConfig[] {
  return [
    {
      type: CARD_TYPES.CLOZE,
      label: cardStrings.cloze.label,
      description: cardStrings.cloze.description,
      recommended: true,
      layout: 'cloze',
      front: { showText: false, textPlaceholder: '', media: null },
      back: { showText: true, textPlaceholder: cardStrings.cloze.backPlaceholder, media: null },
    },
    {
      type: CARD_TYPES.VOCABULARY,
      label: cardStrings.vocabulary.label,
      description: cardStrings.vocabulary.description,
      recommended: false,
      layout: 'vocabulary',
      front: {
        showText: true,
        textPlaceholder: cardStrings.vocabulary.frontPlaceholder,
        media: ALL_MEDIA,
      },
      back: {
        showText: true,
        textPlaceholder: cardStrings.vocabulary.backPlaceholder,
        media: null,
      },
    },
    {
      type: CARD_TYPES.LISTENING,
      label: cardStrings.listening.label,
      description: cardStrings.listening.description,
      recommended: false,
      layout: 'listening',
      front: {
        showText: false,
        textPlaceholder: cardStrings.listening.frontPlaceholder,
        media: null,
      },
      back: {
        showText: false,
        textPlaceholder: cardStrings.listening.backPlaceholder,
        media: null,
      },
    },
    {
      type: CARD_TYPES.TYPING,
      label: cardStrings.typing.label,
      description: cardStrings.typing.description,
      recommended: false,
      layout: 'typing',
      front: {
        showText: false,
        textPlaceholder: cardStrings.typing.frontPlaceholder,
        media: null,
      },
      back: {
        showText: true,
        textPlaceholder: cardStrings.typing.backPlaceholder,
        media: null,
      },
    },
    {
      type: CARD_TYPES.PRONUNCIATION,
      label: cardStrings.pronunciation.label,
      description: cardStrings.pronunciation.description,
      recommended: false,
      layout: 'pronunciation',
      front: {
        showText: true,
        textPlaceholder: cardStrings.pronunciation.frontPlaceholder,
        media: null,
      },
      back: {
        showText: false,
        textPlaceholder: cardStrings.pronunciation.backPlaceholder,
        media: AUDIO_AND_TTS_MEDIA,
      },
    },
  ];
}

export function getCardTypeFormConfig(
  type: CardType,
  cardStrings: StringCatalog['cards']['cardTypes'],
): CardTypeFormConfig {
  const configs = buildCardTypeFormConfigs(cardStrings);
  return configs.find((config) => config.type === type) ?? configs[0];
}
