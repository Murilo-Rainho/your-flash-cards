import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import { SegmentedControl } from '@/components/forms/SegmentedControl';
import { TTS_PLAYBACK_SPEEDS, type TtsPlaybackSpeed } from '@/constants/tts';
import { useTheme } from '@/theme/useTheme';

type TtsPlaybackButtonProps = {
  label: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  playDisabled?: boolean;
  speedDisabled?: boolean;
  isPlaying?: boolean;
  speed: TtsPlaybackSpeed;
  speedLabels: Record<TtsPlaybackSpeed, string>;
  onPlay: () => void;
  onChangeSpeed: (speed: TtsPlaybackSpeed) => void;
};

export function TtsPlaybackButton({
  label,
  accessibilityLabel,
  disabled = false,
  playDisabled = false,
  speedDisabled = false,
  isPlaying = false,
  speed,
  speedLabels,
  onPlay,
  onChangeSpeed,
}: TtsPlaybackButtonProps) {
  const { colors } = useTheme();
  const isPlayDisabled = disabled || playDisabled;
  const speedOptions = [
    { value: TTS_PLAYBACK_SPEEDS.FAST, label: speedLabels.fast },
    { value: TTS_PLAYBACK_SPEEDS.SLOW, label: speedLabels.slow },
  ];

  return (
    <View
      style={{
        borderColor: colors.border,
        backgroundColor: colors.surface,
        opacity: disabled ? 0.5 : 1,
      }}
      className="w-full flex-row items-center overflow-hidden rounded-xl border"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ selected: isPlaying, disabled: isPlayDisabled }}
        disabled={isPlayDisabled}
        onPress={onPlay}
        style={{ opacity: playDisabled ? 0.5 : 1 }}
        className="min-h-14 flex-1 flex-row items-center gap-2 px-4 py-3 active:opacity-90"
      >
        <Icon name="play" size={16} tone="textPrimary" />
        <Text
          style={{ color: colors.textPrimary }}
          className="flex-1 text-base font-medium"
          numberOfLines={1}
        >
          {label}
        </Text>
      </Pressable>
      <View className="p-2">
        <SegmentedControl
          value={speed}
          options={speedOptions}
          disabled={disabled || speedDisabled}
          onChange={onChangeSpeed}
        />
      </View>
    </View>
  );
}
