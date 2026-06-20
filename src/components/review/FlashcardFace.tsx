import { Image, Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import { TtsPlaybackButton } from '@/components/common/TtsPlaybackButton';
import type { TtsPlaybackSpeed } from '@/constants/tts';
import { useTheme } from '@/theme/useTheme';

import type { CardFaceViewModel } from './types';

type FlashcardFaceProps = {
  face: CardFaceViewModel;
  /** Text shown when the side has no content (best-effort preview). */
  emptyHint?: string;
  imageAccessibilityLabel?: string;
  ttsPlaybackSpeed: TtsPlaybackSpeed;
  ttsSpeedLabels: Record<TtsPlaybackSpeed, string>;
  onTtsPlaybackSpeedChange: (speed: TtsPlaybackSpeed) => void;
};

/** Renders ONE card side (text, image, and/or audio). Reused by front and back. */
export function FlashcardFace({
  face,
  emptyHint = 'No content',
  imageAccessibilityLabel = 'Card image',
  ttsPlaybackSpeed,
  ttsSpeedLabels,
  onTtsPlaybackSpeedChange,
}: FlashcardFaceProps) {
  const { colors } = useTheme();
  const isEmpty = !face.text && !face.imageUri && !face.audio;

  return (
    <View className="items-center gap-4">
      {face.imageUri ? (
        <Image
          source={{ uri: face.imageUri }}
          resizeMode="contain"
          accessibilityLabel={imageAccessibilityLabel}
          style={{ backgroundColor: colors.surface }}
          className="h-44 w-full rounded-xl"
        />
      ) : null}

      {face.text ? (
        <Text style={{ color: colors.textPrimary }} className="text-center text-2xl font-semibold">
          {face.text}
        </Text>
      ) : null}

      {face.audio?.type === 'tts' ? (
        <TtsPlaybackButton
          label={face.audio.label}
          accessibilityLabel={face.audio.accessibilityLabel}
          isPlaying={face.audio.isPlaying}
          speed={ttsPlaybackSpeed}
          speedLabels={ttsSpeedLabels}
          onPlay={() => {
            if (face.audio?.type === 'tts') {
              face.audio.onPlay(ttsPlaybackSpeed);
            }
          }}
          onChangeSpeed={onTtsPlaybackSpeedChange}
        />
      ) : face.audio ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={face.audio.accessibilityLabel ?? face.audio.label}
          accessibilityState={{ selected: face.audio.isPlaying }}
          onPress={face.audio.onPlay}
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
          className="flex-row items-center gap-2 rounded-xl border px-4 py-3 active:opacity-90"
        >
          <Icon name="play" size={16} tone="textPrimary" />
          <Text style={{ color: colors.textPrimary }} className="text-base font-medium">
            {face.audio.label}
          </Text>
        </Pressable>
      ) : null}

      {isEmpty ? (
        <Text style={{ color: colors.textSecondary }} className="text-base">
          {emptyHint}
        </Text>
      ) : null}
    </View>
  );
}
