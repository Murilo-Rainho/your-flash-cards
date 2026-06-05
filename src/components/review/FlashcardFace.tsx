import { Image, Pressable, Text, View } from 'react-native';

import type { CardFaceViewModel } from './types';

type FlashcardFaceProps = {
  face: CardFaceViewModel;
  /** Texto exibido quando o lado não tem nenhum conteúdo (preview best-effort). */
  emptyHint?: string;
};

/** Renderiza UM lado do card (texto, imagem e/ou áudio). Reutilizado por frente e verso. */
export function FlashcardFace({ face, emptyHint = 'Sem conteúdo' }: FlashcardFaceProps) {
  const isEmpty = !face.text && !face.imageUri && !face.audio;

  return (
    <View className="items-center gap-4">
      {face.imageUri ? (
        <Image
          source={{ uri: face.imageUri }}
          resizeMode="contain"
          accessibilityLabel="Imagem do card"
          className="h-44 w-full rounded-xl bg-surface"
        />
      ) : null}

      {face.text ? (
        <Text className="text-center text-2xl font-semibold text-textPrimary">{face.text}</Text>
      ) : null}

      {face.audio ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={face.audio.accessibilityLabel ?? face.audio.label}
          accessibilityState={{ selected: face.audio.isPlaying }}
          onPress={face.audio.onPlay}
          className="flex-row items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 active:opacity-90"
        >
          <Text className="text-base">▶</Text>
          <Text className="text-base font-medium text-textPrimary">{face.audio.label}</Text>
        </Pressable>
      ) : null}

      {isEmpty ? <Text className="text-base text-textSecondary">{emptyHint}</Text> : null}
    </View>
  );
}
