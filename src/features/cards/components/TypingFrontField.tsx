import { Image, Pressable, Text, View } from 'react-native';

import { FieldError } from '@/components/common/FieldError';
import { SelectField } from '@/components/forms/SelectField';
import { TextAreaField } from '@/components/forms/TextAreaField';
import { MEDIA_TYPES } from '@/domain/entities/Media';
import { useTheme } from '@/theme/useTheme';
import { formatRecordingDuration } from '@/utils/format';

import {
  TYPING_FRONT_MODE_OPTIONS,
  TYPING_FRONT_MODES,
  type TypingFrontMode,
} from '../config/typingFrontMode';
import { getMediaLabel } from '../services/cardMedia';
import type { CreateCardMediaInput } from '../services/createCard';

type TypingFrontFieldProps = {
  mode: TypingFrontMode;
  /** Texto-fonte do TTS (só usado no modo TTS). */
  text: string;
  textPlaceholder: string;
  media: CreateCardMediaInput[];
  textError?: string;
  mediaError?: string;
  isSaving: boolean;
  isRecording: boolean;
  isRecordingThisSide: boolean;
  recordingDurationMs: number;
  onModeChange: (mode: TypingFrontMode) => void;
  onChangeText: (value: string) => void;
  onPickImage: (source: 'library' | 'camera') => void;
  onPickAudio: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onRemoveMedia: (type: CreateCardMediaInput['type']) => void;
  onTestAudio: () => void;
};

/**
 * Frente do card de Escrita (§11): escolhe a mídia do enunciado (arquivo de áudio, gravação,
 * TTS, foto ou imagem da galeria). Não há campo de texto na frente além da fonte do TTS — a
 * resposta esperada é digitada no verso. O idioma do TTS vem da coleção (sem seletor aqui).
 */
export function TypingFrontField({
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
  onPickImage,
  onPickAudio,
  onStartRecording,
  onStopRecording,
  onRemoveMedia,
  onTestAudio,
}: TypingFrontFieldProps) {
  const { colors } = useTheme();
  const audioMedia = media.find((item) => item.type !== MEDIA_TYPES.IMAGE);
  const imageMedia = media.find((item) => item.type === MEDIA_TYPES.IMAGE);
  const sideError = mediaError ?? textError;

  const canTestAudio = (() => {
    if (mode === TYPING_FRONT_MODES.TTS) {
      return text.trim().length > 0;
    }

    return audioMedia?.type === MEDIA_TYPES.AUDIO || audioMedia?.type === MEDIA_TYPES.RECORDING;
  })();

  const showAudioTest =
    mode === TYPING_FRONT_MODES.TTS ||
    mode === TYPING_FRONT_MODES.AUDIO_FILE ||
    mode === TYPING_FRONT_MODES.RECORDING;

  return (
    <View className="gap-3">
      <SelectField
        label="Frente"
        value={mode}
        placeholder="Escolha o conteudo da frente"
        disabled={isSaving}
        options={TYPING_FRONT_MODE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        onChange={(value) => onModeChange(value as TypingFrontMode)}
      />

      {mode === TYPING_FRONT_MODES.TTS ? (
        <View className="gap-1">
          <TextAreaField
            label="Texto que sera falado"
            value={text}
            placeholder={textPlaceholder}
            error={textError}
            disabled={isSaving}
            onChangeText={onChangeText}
          />
          <Text style={{ color: colors.textSecondary }} className="text-xs">
            A resposta esperada sera este mesmo texto (o verso reutiliza o que voce escrever aqui).
          </Text>
        </View>
      ) : null}

      {mode === TYPING_FRONT_MODES.AUDIO_FILE ? (
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
                accessibilityLabel="Remover arquivo de audio da frente"
                disabled={isSaving}
                onPress={() => onRemoveMedia(MEDIA_TYPES.AUDIO)}
                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                className="items-center rounded-xl border px-4 py-3 active:opacity-90"
              >
                <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                  Remover arquivo
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Enviar arquivo de audio da frente"
              disabled={isSaving || isRecording}
              onPress={onPickAudio}
              style={{ borderColor: colors.border, backgroundColor: colors.background }}
              className="items-center rounded-xl border px-4 py-3 active:opacity-90"
            >
              <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                Enviar arquivo de audio
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

      {mode === TYPING_FRONT_MODES.RECORDING ? (
        <View className="gap-2">
          {audioMedia?.type === MEDIA_TYPES.RECORDING ? (
            <View
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              className="gap-2 rounded-xl border p-3"
            >
              <Text style={{ color: colors.textSecondary }} className="text-sm">
                Gravacao pronta
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remover gravacao da frente"
                disabled={isSaving}
                onPress={() => onRemoveMedia(MEDIA_TYPES.RECORDING)}
                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                className="items-center rounded-xl border px-4 py-3 active:opacity-90"
              >
                <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                  Remover gravacao
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isRecordingThisSide ? 'Parar gravacao da frente' : 'Gravar audio da frente'
              }
              disabled={isSaving || (isRecording && !isRecordingThisSide)}
              onPress={isRecordingThisSide ? onStopRecording : onStartRecording}
              style={{ borderColor: colors.border, backgroundColor: colors.background }}
              className="items-center rounded-xl border px-4 py-3 active:opacity-90"
            >
              <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                {isRecordingThisSide
                  ? `Parar ${formatRecordingDuration(recordingDurationMs)}`
                  : 'Gravar audio'}
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

      {mode === TYPING_FRONT_MODES.IMAGE_CAMERA || mode === TYPING_FRONT_MODES.IMAGE_GALLERY ? (
        <View className="gap-2">
          {imageMedia?.type === MEDIA_TYPES.IMAGE ? (
            <View className="gap-2">
              <Image
                source={{ uri: imageMedia.uri }}
                style={{ backgroundColor: colors.surface }}
                className="h-36 w-full rounded-xl"
                resizeMode="cover"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remover imagem da frente"
                disabled={isSaving}
                onPress={() => onRemoveMedia(MEDIA_TYPES.IMAGE)}
                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                className="items-center rounded-xl border px-4 py-3 active:opacity-90"
              >
                <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                  Remover imagem
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                mode === TYPING_FRONT_MODES.IMAGE_CAMERA
                  ? 'Tirar foto para a frente'
                  : 'Escolher imagem da galeria para a frente'
              }
              disabled={isSaving}
              onPress={() =>
                onPickImage(mode === TYPING_FRONT_MODES.IMAGE_CAMERA ? 'camera' : 'library')
              }
              style={{ borderColor: colors.border, backgroundColor: colors.background }}
              className="items-center rounded-xl border px-4 py-3 active:opacity-90"
            >
              <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                {mode === TYPING_FRONT_MODES.IMAGE_CAMERA ? 'Tirar foto' : 'Escolher da galeria'}
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

      {showAudioTest ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Testar audio da frente"
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
            Testar audio
          </Text>
        </Pressable>
      ) : null}

      <FieldError message={sideError} />
    </View>
  );
}
