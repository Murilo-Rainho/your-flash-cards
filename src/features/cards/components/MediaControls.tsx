import { Image, Pressable, Text, View } from 'react-native';

import { SelectField } from '@/components/forms/SelectField';
import { LANGUAGES, toSpeechLanguage } from '@/constants/languages';
import { MEDIA_TYPES } from '@/domain/entities/Media';
import { useTheme } from '@/theme/useTheme';
import { formatRecordingDuration } from '@/utils/format';

import { getMediaLabel } from '../services/cardMedia';
import type { CreateCardMediaInput } from '../services/createCard';

type MediaControlsProps = {
  label: string;
  media: CreateCardMediaInput[];
  textForTts: string;
  ttsLanguage: string;
  isSaving: boolean;
  isRecording: boolean;
  isRecordingThisSide: boolean;
  recordingDurationMs: number;
  allowImage?: boolean;
  allowAudioFile?: boolean;
  allowRecording?: boolean;
  allowTts?: boolean;
  onPickImage: () => void;
  onTakePhoto: () => void;
  onPickAudio: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onRemoveMedia: (type: CreateCardMediaInput['type']) => void;
  onPlayAudio: (uri: string) => void;
  onToggleTts: () => void;
  onSpeakTts: () => void;
  onTtsLanguageChange: (language: string) => void;
};

/** Controles de mídia (imagem, áudio/arquivo, gravação e TTS) para um lado do card. */
export function MediaControls({
  label,
  media,
  textForTts,
  ttsLanguage,
  isSaving,
  isRecording,
  isRecordingThisSide,
  recordingDurationMs,
  allowImage = false,
  allowAudioFile = false,
  allowRecording = false,
  allowTts = false,
  onPickImage,
  onTakePhoto,
  onPickAudio,
  onStartRecording,
  onStopRecording,
  onRemoveMedia,
  onPlayAudio,
  onToggleTts,
  onSpeakTts,
  onTtsLanguageChange,
}: MediaControlsProps) {
  const { colors } = useTheme();
  const imageMedia = media.find((item) => item.type === MEDIA_TYPES.IMAGE);
  const audioMedia = media.find((item) => item.type !== MEDIA_TYPES.IMAGE);
  const canShowAudioBlock = allowAudioFile || allowRecording || allowTts || audioMedia;

  if (!allowImage && !canShowAudioBlock) {
    return null;
  }

  return (
    <View className="gap-4">
      {allowImage ? (
        <View className="gap-2">
          <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
            Imagem
          </Text>
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
                accessibilityLabel={`Remover imagem de ${label}`}
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
            <View className="flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Escolher imagem de ${label}`}
                disabled={isSaving}
                onPress={onPickImage}
                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                className="flex-1 items-center rounded-xl border px-3 py-3 active:opacity-90"
              >
                <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                  Galeria
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Tirar foto de ${label}`}
                disabled={isSaving}
                onPress={onTakePhoto}
                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                className="flex-1 items-center rounded-xl border px-3 py-3 active:opacity-90"
              >
                <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                  Camera
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : null}

      {canShowAudioBlock ? (
        <View className="gap-2">
          <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
            Audio
          </Text>
          {audioMedia ? (
            <View
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              className="gap-2 rounded-xl border p-3"
            >
              <Text style={{ color: colors.textSecondary }} className="text-sm" numberOfLines={1}>
                {getMediaLabel(audioMedia)}
              </Text>
              <View className="flex-row gap-2">
                {audioMedia.type === MEDIA_TYPES.AUDIO ||
                audioMedia.type === MEDIA_TYPES.RECORDING ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Tocar audio de ${label}`}
                    disabled={isSaving}
                    onPress={() => onPlayAudio(audioMedia.uri)}
                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                    className="flex-1 items-center rounded-xl border px-3 py-3 active:opacity-90"
                  >
                    <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                      Tocar
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Ouvir TTS de ${label}`}
                    disabled={isSaving}
                    onPress={onSpeakTts}
                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                    className="flex-1 items-center rounded-xl border px-3 py-3 active:opacity-90"
                  >
                    <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                      Ouvir
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remover audio de ${label}`}
                  disabled={isSaving}
                  onPress={() => onRemoveMedia(audioMedia.type)}
                  style={{ borderColor: colors.border, backgroundColor: colors.background }}
                  className="flex-1 items-center rounded-xl border px-3 py-3 active:opacity-90"
                >
                  <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                    Remover
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="gap-2">
              <View className="flex-row gap-2">
                {allowAudioFile ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Anexar audio de ${label}`}
                    disabled={isSaving || isRecording}
                    onPress={onPickAudio}
                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                    className="flex-1 items-center rounded-xl border px-3 py-3 active:opacity-90"
                  >
                    <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                      Arquivo
                    </Text>
                  </Pressable>
                ) : null}
                {allowRecording ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      isRecordingThisSide ? `Parar gravacao de ${label}` : `Gravar ${label}`
                    }
                    disabled={isSaving || (isRecording && !isRecordingThisSide)}
                    onPress={isRecordingThisSide ? onStopRecording : onStartRecording}
                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                    className="flex-1 items-center rounded-xl border px-3 py-3 active:opacity-90"
                  >
                    <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                      {isRecordingThisSide
                        ? `Parar ${formatRecordingDuration(recordingDurationMs)}`
                        : 'Gravar'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {allowTts ? (
                <View className="gap-2">
                  <SelectField
                    label="Idioma TTS"
                    value={ttsLanguage}
                    placeholder="Escolha o idioma"
                    disabled={isSaving}
                    options={LANGUAGES.map((language) => ({
                      value: toSpeechLanguage(language.code),
                      label: language.label,
                    }))}
                    onChange={onTtsLanguageChange}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Usar TTS local em ${label}`}
                    disabled={isSaving || !textForTts.trim()}
                    onPress={onToggleTts}
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      opacity: !textForTts.trim() ? 0.5 : 1,
                    }}
                    className="items-center rounded-xl border px-4 py-3 active:opacity-90"
                  >
                    <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                      Usar TTS local
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}
