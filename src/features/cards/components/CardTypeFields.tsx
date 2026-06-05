import { ClozeBackField, ClozeFrontField } from '@/components/forms/ClozeFrontField';
import { TextAreaField } from '@/components/forms/TextAreaField';
import type { CardType } from '@/constants/cardTypes';
import { MEDIA_SIDES, MEDIA_TYPES, type MediaSide } from '@/domain/entities/Media';

import { getCardTypeFormConfig } from '../config/cardTypeForm';
import type { ListeningInputMode } from '../config/listeningInputMode';
import type { VocabularyFrontMode } from '../config/vocabularyFrontMode';
import type { CreateCardMediaInput } from '../services/createCard';
import { ListeningSideField } from './ListeningSideField';
import { MediaControls } from './MediaControls';
import { VocabularyFrontField } from './VocabularyFrontField';

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
  cloze: {
    front: { before: string; gap: string; after: string };
    back: { before: string; gap: string; after: string };
  };
  frontMedia: CreateCardMediaInput[];
  backMedia: CreateCardMediaInput[];
  errors: CardTypeFieldsErrors;
  isSaving: boolean;
  isRecording: boolean;
  recordingSide: MediaSide | null;
  recordingDurationMs: number;
  ttsLanguages: Record<MediaSide, string>;
  listeningModes: Record<MediaSide, ListeningInputMode>;
  vocabularyFrontMode: VocabularyFrontMode;
  onChangeText: (side: MediaSide, value: string) => void;
  onListeningModeChange: (side: MediaSide, mode: ListeningInputMode) => void;
  onVocabularyFrontModeChange: (mode: VocabularyFrontMode) => void;
  onTestListeningAudio: (side: MediaSide) => void;
  onChangeCloze: (side: 'front' | 'back', part: 'before' | 'gap' | 'after', value: string) => void;
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
    listeningModes,
    vocabularyFrontMode,
    onChangeText,
    onListeningModeChange,
    onVocabularyFrontModeChange,
    onTestListeningAudio,
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
          before={cloze.front.before}
          gap={cloze.front.gap}
          after={cloze.front.after}
          error={frontError}
          disabled={isSaving}
          onChangeBefore={(value) => onChangeCloze('front', 'before', value)}
          onChangeGap={(value) => onChangeCloze('front', 'gap', value)}
          onChangeAfter={(value) => onChangeCloze('front', 'after', value)}
        />
        <ClozeBackField
          before={cloze.back.before}
          gap={cloze.back.gap}
          after={cloze.back.after}
          error={backError}
          disabled={isSaving}
          onChangeBefore={(value) => onChangeCloze('back', 'before', value)}
          onChangeGap={(value) => onChangeCloze('back', 'gap', value)}
          onChangeAfter={(value) => onChangeCloze('back', 'after', value)}
        />
      </>
    );
  }

  if (config.layout === 'vocabulary') {
    return (
      <>
        <VocabularyFrontField
          mode={vocabularyFrontMode}
          text={frontText}
          textPlaceholder={config.front.textPlaceholder}
          textError={errors.frontText}
          mediaError={errors.frontMedia}
          media={frontMedia}
          listeningMode={listeningModes.front}
          isSaving={isSaving}
          isRecording={isRecording}
          isRecordingThisSide={recordingSide === MEDIA_SIDES.FRONT}
          recordingDurationMs={recordingDurationMs}
          onModeChange={onVocabularyFrontModeChange}
          onChangeText={(value) => onChangeText(MEDIA_SIDES.FRONT, value)}
          onListeningModeChange={(mode) => onListeningModeChange(MEDIA_SIDES.FRONT, mode)}
          onPickImage={(source) => onPickImage(MEDIA_SIDES.FRONT, source)}
          onPickAudio={() => onPickAudio(MEDIA_SIDES.FRONT)}
          onStartRecording={() => onStartRecording(MEDIA_SIDES.FRONT)}
          onStopRecording={onStopRecording}
          onRemoveMedia={(mediaType) => onRemoveMedia(MEDIA_SIDES.FRONT, mediaType)}
          onPlayAudio={onPlayAudio}
          onTestAudio={() => onTestListeningAudio(MEDIA_SIDES.FRONT)}
        />
        {renderTextField(MEDIA_SIDES.BACK)}
      </>
    );
  }

  if (config.layout === 'listening' || config.layout === 'pronunciation') {
    return (
      <ListeningSideField
        label="Frente"
        mode={listeningModes.front}
        text={frontText}
        textPlaceholder={config.front.textPlaceholder}
        media={frontMedia}
        textError={errors.frontText}
        mediaError={errors.frontMedia}
        isSaving={isSaving}
        isRecording={isRecording}
        isRecordingThisSide={recordingSide === MEDIA_SIDES.FRONT}
        recordingDurationMs={recordingDurationMs}
        onModeChange={(mode) => onListeningModeChange(MEDIA_SIDES.FRONT, mode)}
        onChangeText={(value) => onChangeText(MEDIA_SIDES.FRONT, value)}
        onPickAudio={() => onPickAudio(MEDIA_SIDES.FRONT)}
        onStartRecording={() => onStartRecording(MEDIA_SIDES.FRONT)}
        onStopRecording={onStopRecording}
        onRemoveMedia={() => onRemoveMedia(MEDIA_SIDES.FRONT, MEDIA_TYPES.AUDIO)}
        onTestAudio={() => onTestListeningAudio(MEDIA_SIDES.FRONT)}
      />
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
