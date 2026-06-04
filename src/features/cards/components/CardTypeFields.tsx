import { Pressable, Text, View } from 'react-native';

import { ClozeFrontField } from '@/components/forms/ClozeFrontField';
import { FieldError } from '@/components/common/FieldError';
import { SelectField } from '@/components/forms/SelectField';
import { TextAreaField } from '@/components/forms/TextAreaField';
import { LANGUAGES, toSpeechLanguage } from '@/constants/languages';
import type { CardType } from '@/constants/cardTypes';
import { MEDIA_SIDES, type MediaSide } from '@/domain/entities/Media';

import { getCardTypeFormConfig } from '../config/cardTypeForm';
import type { CreateCardMediaInput } from '../services/createCard';
import { MediaControls } from './MediaControls';

type CardTypeFieldsErrors = {
  frontText?: string;
  frontMedia?: string;
  backText?: string;
  backMedia?: string;
};

type CardTypeFieldsProps = {
  type: CardType;
  frontText: string;
  backText: string;
  cloze: { before: string; gap: string; after: string };
  frontMedia: CreateCardMediaInput[];
  backMedia: CreateCardMediaInput[];
  errors: CardTypeFieldsErrors;
  isSaving: boolean;
  isRecording: boolean;
  recordingSide: MediaSide | null;
  recordingDurationMs: number;
  ttsLanguages: Record<MediaSide, string>;
  onChangeText: (side: MediaSide, value: string) => void;
  onChangeCloze: (part: 'before' | 'gap' | 'after', value: string) => void;
  onPickImage: (side: MediaSide, source: 'library' | 'camera') => void;
  onPickAudio: (side: MediaSide) => void;
  onStartRecording: (side: MediaSide) => void;
  onStopRecording: () => void;
  onRemoveMedia: (side: MediaSide, type: CreateCardMediaInput['type']) => void;
  onPlayAudio: (uri: string) => void;
  onToggleTts: (side: MediaSide) => void;
  onSpeakTts: (side: MediaSide) => void;
  onTtsLanguageChange: (side: MediaSide, language: string) => void;
};

/** Renderiza os campos de conteúdo do card conforme o layout do tipo selecionado. */
export function CardTypeFields(props: CardTypeFieldsProps) {
  const {
    type,
    frontText,
    backText,
    cloze,
    frontMedia,
    backMedia,
    errors,
    isSaving,
    isRecording,
    recordingSide,
    recordingDurationMs,
    ttsLanguages,
    onChangeText,
    onChangeCloze,
    onPickImage,
    onPickAudio,
    onStartRecording,
    onStopRecording,
    onRemoveMedia,
    onPlayAudio,
    onToggleTts,
    onSpeakTts,
    onTtsLanguageChange,
  } = props;
  const config = getCardTypeFormConfig(type);
  const frontError = errors.frontText ?? errors.frontMedia;
  const backError = errors.backText ?? errors.backMedia;

  const renderTextField = (side: MediaSide) => {
    const sideConfig = side === MEDIA_SIDES.FRONT ? config.front : config.back;

    if (!sideConfig.showText) {
      return null;
    }

    const isFront = side === MEDIA_SIDES.FRONT;

    return (
      <TextAreaField
        label={isFront ? 'Frente' : 'Verso'}
        value={isFront ? frontText : backText}
        placeholder={sideConfig.textPlaceholder}
        error={isFront ? frontError : backError}
        disabled={isSaving}
        onChangeText={(value) => onChangeText(side, value)}
      />
    );
  };

  const renderMedia = (side: MediaSide) => {
    const sideConfig = side === MEDIA_SIDES.FRONT ? config.front : config.back;
    const capabilities = sideConfig.media;

    if (!capabilities) {
      return null;
    }

    const isFront = side === MEDIA_SIDES.FRONT;

    return (
      <MediaControls
        label={isFront ? 'Frente' : 'Verso'}
        media={isFront ? frontMedia : backMedia}
        textForTts={isFront ? frontText : backText}
        ttsLanguage={ttsLanguages[side]}
        isSaving={isSaving}
        isRecording={isRecording}
        isRecordingThisSide={recordingSide === side}
        recordingDurationMs={recordingDurationMs}
        allowImage={capabilities.allowImage}
        allowAudioFile={capabilities.allowAudioFile}
        allowRecording={capabilities.allowRecording}
        allowTts={capabilities.allowTts}
        onPickImage={() => onPickImage(side, 'library')}
        onTakePhoto={() => onPickImage(side, 'camera')}
        onPickAudio={() => onPickAudio(side)}
        onStartRecording={() => onStartRecording(side)}
        onStopRecording={onStopRecording}
        onRemoveMedia={(mediaType) => onRemoveMedia(side, mediaType)}
        onPlayAudio={onPlayAudio}
        onToggleTts={() => onToggleTts(side)}
        onSpeakTts={() => onSpeakTts(side)}
        onTtsLanguageChange={(language) => onTtsLanguageChange(side, language)}
      />
    );
  };

  if (config.layout === 'cloze') {
    return (
      <>
        <ClozeFrontField
          before={cloze.before}
          gap={cloze.gap}
          after={cloze.after}
          error={frontError}
          disabled={isSaving}
          onChangeBefore={(value) => onChangeCloze('before', value)}
          onChangeGap={(value) => onChangeCloze('gap', value)}
          onChangeAfter={(value) => onChangeCloze('after', value)}
        />
        {renderTextField(MEDIA_SIDES.BACK)}
      </>
    );
  }

  if (config.layout === 'pronunciation') {
    return (
      <>
        <View className="gap-2">
          <Text className="text-sm font-semibold text-textPrimary">Frente</Text>
          {renderMedia(MEDIA_SIDES.FRONT)}
          <FieldError message={frontError} />
        </View>
        {renderTextField(MEDIA_SIDES.BACK)}
        <View className="gap-2">
          <SelectField
            label="Idioma TTS"
            value={ttsLanguages.back}
            placeholder="Escolha o idioma"
            disabled={isSaving}
            options={LANGUAGES.map((language) => ({
              value: toSpeechLanguage(language.code),
              label: language.label,
            }))}
            onChange={(language) => onTtsLanguageChange(MEDIA_SIDES.BACK, language)}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ouvir preview TTS"
            disabled={isSaving || !backText.trim()}
            onPress={() => onSpeakTts(MEDIA_SIDES.BACK)}
            className={`items-center rounded-xl border border-border bg-surface px-4 py-3 active:bg-background ${
              !backText.trim() ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-base font-semibold text-textPrimary">Ouvir TTS</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      {renderTextField(MEDIA_SIDES.FRONT)}
      {renderMedia(MEDIA_SIDES.FRONT)}
      {renderTextField(MEDIA_SIDES.BACK)}
      {renderMedia(MEDIA_SIDES.BACK)}
    </>
  );
}
