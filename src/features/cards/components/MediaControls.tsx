import { Image, Pressable, Text, View } from 'react-native';

import { TtsPlaybackButton } from '@/components/common/TtsPlaybackButton';
import { SelectField } from '@/components/forms/SelectField';
import { LANGUAGES, toSpeechLanguage } from '@/constants/languages';
import type { TtsPlaybackSpeed } from '@/constants/tts';
import { MEDIA_TYPES } from '@/domain/entities/Media';
import { usePreferences } from '@/features/settings/providers/PreferencesProvider';
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
  onSpeakTts: (speed: TtsPlaybackSpeed) => void;
  onTtsLanguageChange: (language: string) => void;
};

/** Media controls (image, audio/file, recording, and TTS) for one card side. */
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
  const { setTtsPlaybackSpeed, strings, ttsPlaybackSpeed } = usePreferences();
  const mediaStrings = strings.cards.media;
  const speedLabels = {
    fast: strings.common.fast,
    slow: strings.common.slow,
  };
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
            {mediaStrings.imageLabel}
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
                accessibilityLabel={`${mediaStrings.removeImageA11y} ${label}`}
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
            <View className="flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${mediaStrings.chooseImageA11y} ${label}`}
                disabled={isSaving}
                onPress={onPickImage}
                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                className="flex-1 items-center rounded-xl border px-3 py-3 active:opacity-90"
              >
                <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                  {mediaStrings.gallery}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${mediaStrings.takePhotoA11y} ${label}`}
                disabled={isSaving}
                onPress={onTakePhoto}
                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                className="flex-1 items-center rounded-xl border px-3 py-3 active:opacity-90"
              >
                <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                  {mediaStrings.camera}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : null}

      {canShowAudioBlock ? (
        <View className="gap-2">
          <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
            {mediaStrings.audioLabel}
          </Text>
          {audioMedia ? (
            <View
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              className="gap-2 rounded-xl border p-3"
            >
              <Text style={{ color: colors.textSecondary }} className="text-sm" numberOfLines={1}>
                {getMediaLabel(audioMedia)}
              </Text>
              {audioMedia.type === MEDIA_TYPES.AUDIO ||
              audioMedia.type === MEDIA_TYPES.RECORDING ? (
                <View className="flex-row gap-2">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${mediaStrings.playAudioA11y} ${label}`}
                    disabled={isSaving}
                    onPress={() => onPlayAudio(audioMedia.uri)}
                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                    className="flex-1 items-center rounded-xl border px-3 py-3 active:opacity-90"
                  >
                    <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                      {mediaStrings.play}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${mediaStrings.removeAudioA11y} ${label}`}
                    disabled={isSaving}
                    onPress={() => onRemoveMedia(audioMedia.type)}
                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                    className="flex-1 items-center rounded-xl border px-3 py-3 active:opacity-90"
                  >
                    <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                      {mediaStrings.remove}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View className="gap-2">
                  <TtsPlaybackButton
                    label={mediaStrings.listen}
                    accessibilityLabel={`${mediaStrings.playTtsA11y} ${label}`}
                    disabled={isSaving}
                    speed={ttsPlaybackSpeed}
                    speedLabels={speedLabels}
                    onPlay={() => onSpeakTts(ttsPlaybackSpeed)}
                    onChangeSpeed={(speed) => {
                      void setTtsPlaybackSpeed(speed).catch(() => undefined);
                    }}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${mediaStrings.removeAudioA11y} ${label}`}
                    disabled={isSaving}
                    onPress={() => onRemoveMedia(audioMedia.type)}
                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                    className="items-center rounded-xl border px-3 py-3 active:opacity-90"
                  >
                    <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                      {mediaStrings.remove}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : (
            <View className="gap-2">
              <View className="flex-row gap-2">
                {allowAudioFile ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${mediaStrings.attachAudioA11y} ${label}`}
                    disabled={isSaving || isRecording}
                    onPress={onPickAudio}
                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                    className="flex-1 items-center rounded-xl border px-3 py-3 active:opacity-90"
                  >
                    <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                      {mediaStrings.file}
                    </Text>
                  </Pressable>
                ) : null}
                {allowRecording ? (
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
                    className="flex-1 items-center rounded-xl border px-3 py-3 active:opacity-90"
                  >
                    <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                      {isRecordingThisSide
                        ? `${mediaStrings.stopRecordingPrefix} ${formatRecordingDuration(recordingDurationMs)}`
                        : mediaStrings.record}
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {allowTts ? (
                <View className="gap-2">
                  <SelectField
                    label={mediaStrings.ttsLanguageLabel}
                    value={ttsLanguage}
                    placeholder={mediaStrings.ttsLanguagePlaceholder}
                    disabled={isSaving}
                    options={LANGUAGES.map((language) => ({
                      value: toSpeechLanguage(language.code),
                      label: language.label,
                    }))}
                    onChange={onTtsLanguageChange}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${mediaStrings.useLocalTtsA11y} ${label}`}
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
                      {mediaStrings.useLocalTts}
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
