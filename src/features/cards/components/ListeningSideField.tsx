import { Pressable, Text, View } from 'react-native';

import { FieldError } from '@/components/common/FieldError';
import { SelectField } from '@/components/forms/SelectField';
import { TextAreaField } from '@/components/forms/TextAreaField';
import { MEDIA_TYPES } from '@/domain/entities/Media';
import { formatRecordingDuration } from '@/utils/format';

import {
  LISTENING_INPUT_MODE_OPTIONS,
  LISTENING_INPUT_MODES,
  type ListeningInputMode,
} from '../config/listeningInputMode';
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
  onModeChange,
  onChangeText,
  onPickAudio,
  onStartRecording,
  onStopRecording,
  onRemoveMedia,
  onTestAudio,
}: ListeningSideFieldProps) {
  const audioMedia = media.find((item) => item.type !== MEDIA_TYPES.IMAGE);
  const sideError = textError ?? mediaError;

  const canTestAudio = (() => {
    if (mode === LISTENING_INPUT_MODES.TTS) {
      return text.trim().length > 0;
    }

    return audioMedia?.type === MEDIA_TYPES.AUDIO || audioMedia?.type === MEDIA_TYPES.RECORDING;
  })();

  return (
    <View className="gap-3">
      <Text className="text-sm font-semibold text-textPrimary">{label}</Text>

      <SelectField
        label="Como adicionar o audio"
        value={mode}
        placeholder="Escolha uma opcao"
        disabled={isSaving}
        options={LISTENING_INPUT_MODE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        onChange={(value) => onModeChange(value as ListeningInputMode)}
      />

      {mode === LISTENING_INPUT_MODES.TTS ? (
        <TextAreaField
          label="Texto"
          value={text}
          placeholder={textPlaceholder}
          error={textError}
          disabled={isSaving}
          onChangeText={onChangeText}
        />
      ) : null}

      {mode === LISTENING_INPUT_MODES.AUDIO_FILE ? (
        <View className="gap-2">
          {audioMedia?.type === MEDIA_TYPES.AUDIO ? (
            <View className="gap-2 rounded-xl border border-border bg-surface p-3">
              <Text className="text-sm text-textSecondary" numberOfLines={1}>
                {getMediaLabel(audioMedia)}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remover arquivo de audio de ${label}`}
                disabled={isSaving}
                onPress={onRemoveMedia}
                className="items-center rounded-xl border border-border bg-background px-4 py-3 active:bg-surface"
              >
                <Text className="text-sm font-semibold text-textPrimary">Remover arquivo</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Enviar arquivo de audio de ${label}`}
              disabled={isSaving || isRecording}
              onPress={onPickAudio}
              className="items-center rounded-xl border border-border bg-background px-4 py-3 active:bg-surface"
            >
              <Text className="text-sm font-semibold text-textPrimary">
                Enviar arquivo de audio
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

      {mode === LISTENING_INPUT_MODES.RECORDING ? (
        <View className="gap-2">
          {audioMedia?.type === MEDIA_TYPES.RECORDING ? (
            <View className="gap-2 rounded-xl border border-border bg-surface p-3">
              <Text className="text-sm text-textSecondary">Gravacao pronta</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remover gravacao de ${label}`}
                disabled={isSaving}
                onPress={onRemoveMedia}
                className="items-center rounded-xl border border-border bg-background px-4 py-3 active:bg-surface"
              >
                <Text className="text-sm font-semibold text-textPrimary">Remover gravacao</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isRecordingThisSide ? `Parar gravacao de ${label}` : `Gravar audio de ${label}`
              }
              disabled={isSaving || (isRecording && !isRecordingThisSide)}
              onPress={isRecordingThisSide ? onStopRecording : onStartRecording}
              className="items-center rounded-xl border border-border bg-background px-4 py-3 active:bg-surface"
            >
              <Text className="text-sm font-semibold text-textPrimary">
                {isRecordingThisSide
                  ? `Parar ${formatRecordingDuration(recordingDurationMs)}`
                  : 'Gravar audio'}
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Testar audio de ${label}`}
        disabled={isSaving || !canTestAudio}
        onPress={onTestAudio}
        className={`items-center rounded-xl border border-border bg-surface px-4 py-3 active:bg-background ${
          !canTestAudio ? 'opacity-50' : ''
        }`}
      >
        <Text className="text-base font-semibold text-textPrimary">Testar audio</Text>
      </Pressable>

      <FieldError message={sideError} />
    </View>
  );
}
