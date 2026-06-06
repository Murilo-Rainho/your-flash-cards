import { Image, Pressable, Text, View } from 'react-native';

import { FieldError } from '@/components/common/FieldError';
import { SelectField } from '@/components/forms/SelectField';
import { TextAreaField } from '@/components/forms/TextAreaField';
import { MEDIA_TYPES } from '@/domain/entities/Media';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';
import { formatRecordingDuration } from '@/utils/format';

import { TYPING_FRONT_MODES, type TypingFrontMode } from '../config/typingFrontMode';
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
  const strings = useStrings();
  const mediaStrings = strings.cards.media;
  const audioMedia = media.find((item) => item.type !== MEDIA_TYPES.IMAGE);
  const imageMedia = media.find((item) => item.type === MEDIA_TYPES.IMAGE);
  const sideError = mediaError ?? textError;
  const modeOptions = [
    { value: TYPING_FRONT_MODES.AUDIO_FILE, label: strings.cards.inputModes.audioFile },
    { value: TYPING_FRONT_MODES.RECORDING, label: strings.cards.inputModes.recording },
    { value: TYPING_FRONT_MODES.TTS, label: strings.cards.inputModes.tts },
    { value: TYPING_FRONT_MODES.IMAGE_CAMERA, label: strings.cards.inputModes.imageCamera },
    { value: TYPING_FRONT_MODES.IMAGE_GALLERY, label: strings.cards.inputModes.imageGallery },
  ];

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
        label={strings.common.front}
        value={mode}
        placeholder={mediaStrings.chooseFrontContentPlaceholder}
        disabled={isSaving}
        options={modeOptions}
        onChange={(value) => onModeChange(value as TypingFrontMode)}
      />

      {mode === TYPING_FRONT_MODES.TTS ? (
        <View className="gap-1">
          <TextAreaField
            label={mediaStrings.textLabel}
            value={text}
            placeholder={textPlaceholder}
            error={textError}
            disabled={isSaving}
            onChangeText={onChangeText}
          />
          <Text style={{ color: colors.textSecondary }} className="text-xs">
            {mediaStrings.typingTtsReuseHint}
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
                accessibilityLabel={`${mediaStrings.removeAudioFileA11y} ${strings.common.front}`}
                disabled={isSaving}
                onPress={() => onRemoveMedia(MEDIA_TYPES.AUDIO)}
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
              accessibilityLabel={`${mediaStrings.uploadAudioFileA11y} ${strings.common.front}`}
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

      {mode === TYPING_FRONT_MODES.RECORDING ? (
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
                accessibilityLabel={`${mediaStrings.removeRecordingA11y} ${strings.common.front}`}
                disabled={isSaving}
                onPress={() => onRemoveMedia(MEDIA_TYPES.RECORDING)}
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
                  ? `${mediaStrings.stopRecordingA11y} ${strings.common.front}`
                  : `${mediaStrings.recordAudioA11y} ${strings.common.front}`
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
                accessibilityLabel={`${mediaStrings.removeImageA11y} ${strings.common.front}`}
                disabled={isSaving}
                onPress={() => onRemoveMedia(MEDIA_TYPES.IMAGE)}
                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                className="items-center rounded-xl border px-4 py-3 active:opacity-90"
              >
                <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                  {mediaStrings.removeImage}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                mode === TYPING_FRONT_MODES.IMAGE_CAMERA
                  ? `${mediaStrings.takePhotoA11y} ${strings.common.front}`
                  : `${mediaStrings.chooseImageA11y} ${strings.common.front}`
              }
              disabled={isSaving}
              onPress={() =>
                onPickImage(mode === TYPING_FRONT_MODES.IMAGE_CAMERA ? 'camera' : 'library')
              }
              style={{ borderColor: colors.border, backgroundColor: colors.background }}
              className="items-center rounded-xl border px-4 py-3 active:opacity-90"
            >
              <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                {mode === TYPING_FRONT_MODES.IMAGE_CAMERA
                  ? mediaStrings.takePhoto
                  : mediaStrings.chooseFromGallery}
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

      {showAudioTest ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${mediaStrings.testAudioA11y} ${strings.common.front}`}
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
      ) : null}

      <FieldError message={sideError} />
    </View>
  );
}
