import { Pressable, Text, View } from 'react-native';

import { FieldError } from '@/components/common/FieldError';
import { SelectField } from '@/components/forms/SelectField';
import { TextAreaField } from '@/components/forms/TextAreaField';
import { MEDIA_TYPES } from '@/domain/entities/Media';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';
import { formatRecordingDuration } from '@/utils/format';

import { LISTENING_INPUT_MODES, type ListeningInputMode } from '../config/listeningInputMode';
import { getMediaLabel } from '../services/cardMedia';
import type { CreateCardMediaInput } from '../services/createCard';

type ListeningSideFieldProps = {
  label: string;
  mode: ListeningInputMode;
  text: string;
  textPlaceholder: string;
  media: CreateCardMediaInput[];
  textError?: string;
  mediaError?: string;
  isSaving: boolean;
  isRecording: boolean;
  isRecordingThisSide: boolean;
  recordingDurationMs: number;
  /**
   * Quando true, o modo TTS NÃO renderiza um campo de texto próprio: a frase falada vem de
   * outro lado do card (ex.: Pronúncia reutiliza o texto da frente). `text` é só leitura aqui.
   */
  reuseTextForTts?: boolean;
  onModeChange: (mode: ListeningInputMode) => void;
  onChangeText: (value: string) => void;
  onPickAudio: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onRemoveMedia: () => void;
  onTestAudio: () => void;
};

/** Um lado (frente/verso) do card de Escuta: modo exclusivo + teste de audio. */
export function ListeningSideField({
  label,
  mode,
  text,
  textPlaceholder,
  media,
  textError,
  mediaError,
  isSaving,
  isRecording,
  isRecordingThisSide,
  recordingDurationMs,
  reuseTextForTts = false,
  onModeChange,
  onChangeText,
  onPickAudio,
  onStartRecording,
  onStopRecording,
  onRemoveMedia,
  onTestAudio,
}: ListeningSideFieldProps) {
  const { colors } = useTheme();
  const strings = useStrings();
  const mediaStrings = strings.cards.media;
  const audioMedia = media.find((item) => item.type !== MEDIA_TYPES.IMAGE);
  const sideError = textError ?? mediaError;
  const modeOptions = [
    { value: LISTENING_INPUT_MODES.AUDIO_FILE, label: strings.cards.inputModes.audioFile },
    { value: LISTENING_INPUT_MODES.RECORDING, label: strings.cards.inputModes.recording },
    { value: LISTENING_INPUT_MODES.TTS, label: strings.cards.inputModes.tts },
  ];

  const canTestAudio = (() => {
    if (mode === LISTENING_INPUT_MODES.TTS) {
      return text.trim().length > 0;
    }

    return audioMedia?.type === MEDIA_TYPES.AUDIO || audioMedia?.type === MEDIA_TYPES.RECORDING;
  })();

  return (
    <View className="gap-3">
      <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
        {label}
      </Text>

      <SelectField
        label={mediaStrings.addAudioLabel}
        value={mode}
        placeholder={mediaStrings.chooseOptionPlaceholder}
        disabled={isSaving}
        options={modeOptions}
        onChange={(value) => onModeChange(value as ListeningInputMode)}
      />

      {mode === LISTENING_INPUT_MODES.TTS && !reuseTextForTts ? (
        <TextAreaField
          label={mediaStrings.textLabel}
          value={text}
          placeholder={textPlaceholder}
          error={textError}
          disabled={isSaving}
          onChangeText={onChangeText}
        />
      ) : null}

      {mode === LISTENING_INPUT_MODES.TTS && reuseTextForTts ? (
        <Text style={{ color: colors.textSecondary }} className="text-xs">
          {mediaStrings.ttsReadsFrontText}
        </Text>
      ) : null}

      {mode === LISTENING_INPUT_MODES.AUDIO_FILE ? (
        <View className="gap-2">
          {audioMedia?.type === MEDIA_TYPES.AUDIO ? (
            <View
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              className="gap-2 rounded-xl border p-3"
            >
              <Text style={{ color: colors.textSecondary }} className="text-sm" numberOfLines={1}>
                {getMediaLabel(audioMedia)}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${mediaStrings.removeAudioFileA11y} ${label}`}
                disabled={isSaving}
                onPress={onRemoveMedia}
                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                className="items-center rounded-xl border px-4 py-3 active:opacity-90"
              >
                <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                  {mediaStrings.removeFile}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${mediaStrings.uploadAudioFileA11y} ${label}`}
              disabled={isSaving || isRecording}
              onPress={onPickAudio}
              style={{ borderColor: colors.border, backgroundColor: colors.background }}
              className="items-center rounded-xl border px-4 py-3 active:opacity-90"
            >
              <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                {mediaStrings.uploadAudioFile}
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

      {mode === LISTENING_INPUT_MODES.RECORDING ? (
        <View className="gap-2">
          {audioMedia?.type === MEDIA_TYPES.RECORDING ? (
            <View
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              className="gap-2 rounded-xl border p-3"
            >
              <Text style={{ color: colors.textSecondary }} className="text-sm">
                {mediaStrings.recordingReady}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${mediaStrings.removeRecordingA11y} ${label}`}
                disabled={isSaving}
                onPress={onRemoveMedia}
                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                className="items-center rounded-xl border px-4 py-3 active:opacity-90"
              >
                <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                  {mediaStrings.removeRecording}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isRecordingThisSide
                  ? `${mediaStrings.stopRecordingA11y} ${label}`
                  : `${mediaStrings.recordAudioA11y} ${label}`
              }
              disabled={isSaving || (isRecording && !isRecordingThisSide)}
              onPress={isRecordingThisSide ? onStopRecording : onStartRecording}
              style={{ borderColor: colors.border, backgroundColor: colors.background }}
              className="items-center rounded-xl border px-4 py-3 active:opacity-90"
            >
              <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                {isRecordingThisSide
                  ? `${mediaStrings.stopRecordingPrefix} ${formatRecordingDuration(recordingDurationMs)}`
                  : mediaStrings.recordAudio}
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${mediaStrings.testAudioA11y} ${label}`}
        disabled={isSaving || !canTestAudio}
        onPress={onTestAudio}
        style={{
          borderColor: colors.border,
          backgroundColor: colors.surface,
          opacity: !canTestAudio ? 0.5 : 1,
        }}
        className="items-center rounded-xl border px-4 py-3 active:opacity-90"
      >
        <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
          {mediaStrings.testAudio}
        </Text>
      </Pressable>

      <FieldError message={sideError} />
    </View>
  );
}
