import { View } from 'react-native';

import { SelectField } from '@/components/forms/SelectField';
import { TextAreaField } from '@/components/forms/TextAreaField';
import { MEDIA_TYPES } from '@/domain/entities/Media';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';

import { VOCABULARY_FRONT_MODES, type VocabularyFrontMode } from '../config/vocabularyFrontMode';
import type { ListeningInputMode } from '../config/listeningInputMode';
import type { CreateCardMediaInput } from '../services/createCard';
import { ListeningSideField } from './ListeningSideField';
import { MediaControls } from './MediaControls';

type VocabularyFrontFieldProps = {
  mode: VocabularyFrontMode;
  text: string;
  textPlaceholder: string;
  textError?: string;
  mediaError?: string;
  media: CreateCardMediaInput[];
  listeningMode: ListeningInputMode;
  isSaving: boolean;
  isRecording: boolean;
  isRecordingThisSide: boolean;
  recordingDurationMs: number;
  onModeChange: (mode: VocabularyFrontMode) => void;
  onChangeText: (value: string) => void;
  onListeningModeChange: (mode: ListeningInputMode) => void;
  onPickImage: (source: 'library' | 'camera') => void;
  onPickAudio: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onRemoveMedia: (type: CreateCardMediaInput['type']) => void;
  onPlayAudio: (uri: string) => void;
  onTestAudio: () => void;
};

/** Frente do card de Vocabulário: escolhe entre texto simples, imagem ou áudio. */
export function VocabularyFrontField({
  mode,
  text,
  textPlaceholder,
  textError,
  mediaError,
  media,
  listeningMode,
  isSaving,
  isRecording,
  isRecordingThisSide,
  recordingDurationMs,
  onModeChange,
  onChangeText,
  onListeningModeChange,
  onPickImage,
  onPickAudio,
  onStartRecording,
  onStopRecording,
  onRemoveMedia,
  onPlayAudio,
  onTestAudio,
}: VocabularyFrontFieldProps) {
  const strings = useStrings();
  const modeOptions = [
    { value: VOCABULARY_FRONT_MODES.TEXT, label: strings.cards.inputModes.vocabularyText },
    { value: VOCABULARY_FRONT_MODES.IMAGE, label: strings.cards.inputModes.vocabularyImage },
    { value: VOCABULARY_FRONT_MODES.AUDIO, label: strings.cards.inputModes.vocabularyAudio },
  ];

  return (
    <View className="gap-3">
      <SelectField
        label={strings.common.front}
        value={mode}
        placeholder={strings.cards.media.chooseFrontTypePlaceholder}
        disabled={isSaving}
        options={modeOptions}
        onChange={(value) => onModeChange(value as VocabularyFrontMode)}
      />

      {mode === VOCABULARY_FRONT_MODES.TEXT ? (
        <TextAreaField
          label={strings.cards.media.textLabel}
          value={text}
          placeholder={textPlaceholder}
          error={textError}
          disabled={isSaving}
          onChangeText={onChangeText}
        />
      ) : null}

      {mode === VOCABULARY_FRONT_MODES.IMAGE ? (
        <MediaControls
          label={strings.common.front}
          media={media}
          textForTts=""
          ttsLanguage=""
          isSaving={isSaving}
          isRecording={isRecording}
          isRecordingThisSide={isRecordingThisSide}
          recordingDurationMs={recordingDurationMs}
          allowImage
          onPickImage={() => onPickImage('library')}
          onTakePhoto={() => onPickImage('camera')}
          onPickAudio={onPickAudio}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          onRemoveMedia={onRemoveMedia}
          onPlayAudio={onPlayAudio}
          onToggleTts={() => undefined}
          onSpeakTts={() => undefined}
          onTtsLanguageChange={() => undefined}
        />
      ) : null}

      {mode === VOCABULARY_FRONT_MODES.AUDIO ? (
        <ListeningSideField
          label={strings.common.front}
          mode={listeningMode}
          text={text}
          textPlaceholder={textPlaceholder}
          media={media}
          textError={textError}
          mediaError={mediaError}
          isSaving={isSaving}
          isRecording={isRecording}
          isRecordingThisSide={isRecordingThisSide}
          recordingDurationMs={recordingDurationMs}
          onModeChange={onListeningModeChange}
          onChangeText={onChangeText}
          onPickAudio={onPickAudio}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          onRemoveMedia={() => onRemoveMedia(MEDIA_TYPES.AUDIO)}
          onTestAudio={onTestAudio}
        />
      ) : null}
    </View>
  );
}
