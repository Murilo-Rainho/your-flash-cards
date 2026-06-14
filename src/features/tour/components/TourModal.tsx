import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';

import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

type TourModalProps = {
  visible: boolean;
  /** Toque no scrim (fora do cartão). */
  onScrimPress: () => void;
  closeAccessibilityLabel: string;
  children: ReactNode;
};

/**
 * Casca de modal centralizada do tour — mesma linguagem visual do `BottomSheet`
 * (scrim escurecido, surface arredondada, sombra), mas centralizada para steps.
 * UI burra: apenas apresenta o conteúdo e delega o fechamento via `onScrimPress`.
 */
export function TourModal({
  visible,
  onScrimPress,
  closeAccessibilityLabel,
  children,
}: TourModalProps) {
  const { colors, shadows } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onScrimPress}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={closeAccessibilityLabel}
        onPress={onScrimPress}
        style={{ backgroundColor: withAlpha(colors.textPrimary, 0.4) }}
        className="flex-1 items-center justify-center p-6"
      >
        {/* Cartão: Pressable que não propaga o toque para não fechar ao tocar dentro. */}
        <Pressable onPress={() => undefined} className="w-full max-w-md">
          <View
            style={{ backgroundColor: colors.surface, ...shadows.lg }}
            className="gap-4 rounded-2xl p-5"
          >
            {children}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
