import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Rótulo de acessibilidade do scrim (toque fora fecha a folha). */
  closeAccessibilityLabel: string;
  /** Título opcional exibido no topo da folha. */
  title?: string;
  /** Altura máxima da área rolável do conteúdo. */
  maxContentHeight?: number;
  children: ReactNode;
};

/**
 * Bottom sheet padrão do app — mesma linguagem visual do `QuickActionsFab`: scrim
 * escurecido, folha com cantos arredondados, sombra e "puxador" (drag handle).
 *
 * UI burra: apenas apresenta o conteúdo e delega o fechamento via `onClose` (toque no
 * scrim). O consumidor é responsável por ações/estado.
 */
export function BottomSheet({
  visible,
  onClose,
  closeAccessibilityLabel,
  title,
  maxContentHeight = 480,
  children,
}: BottomSheetProps) {
  const { colors, shadows } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={closeAccessibilityLabel}
        onPress={onClose}
        style={{ backgroundColor: `${colors.textPrimary}66` }}
        className="flex-1 justify-end p-4"
      >
        {/* Folha: Pressable que não propaga o toque para não fechar ao tocar dentro. */}
        <Pressable onPress={() => undefined}>
          <View
            style={{ backgroundColor: colors.background, ...shadows.lg }}
            className="rounded-2xl p-2 pt-3"
          >
            <View
              style={{ backgroundColor: withAlpha(colors.textSecondary, 0.3) }}
              className="mb-2 h-1 w-10 self-center rounded-full"
            />
            {title ? (
              <Text style={{ color: colors.textPrimary }} className="px-3 pb-2 text-lg font-bold">
                {title}
              </Text>
            ) : null}
            <ScrollView style={{ maxHeight: maxContentHeight }} keyboardShouldPersistTaps="handled">
              <View className="gap-4 px-2 pb-2">{children}</View>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
