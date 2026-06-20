import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';

import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

type TourModalProps = {
  visible: boolean;
  /** Scrim tap (outside the card). */
  onScrimPress: () => void;
  closeAccessibilityLabel: string;
  children: ReactNode;
};

/**
 * Centered tour modal shell — same visual language as `BottomSheet`
 * (dimmed scrim, rounded surface, shadow), but centered for steps.
 * Dumb UI: only presents content and delegates closing via `onScrimPress`.
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
        {/* Card: Pressable that does not propagate taps so inner touches do not close. */}
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
