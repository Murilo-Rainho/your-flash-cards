import { Image, Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import { useTheme } from '@/theme/useTheme';

import type { CardFaceViewModel } from './types';

type FlashcardFaceProps = {
  face: CardFaceViewModel;
  /** Texto exibido quando o lado não tem nenhum conteúdo (preview best-effort). */
  emptyHint?: string;
  imageAccessibilityLabel?: string;
};

/** Renderiza UM lado do card (texto, imagem e/ou áudio). Reutilizado por frente e verso. */
export function FlashcardFace({
  face,
  emptyHint = 'No content',
  imageAccessibilityLabel = 'Card image',
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

      {face.audio ? (
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
