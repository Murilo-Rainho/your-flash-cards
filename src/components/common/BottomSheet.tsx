import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Accessibility label for the scrim (tap outside closes the sheet). */
  closeAccessibilityLabel: string;
  /** Optional title shown at the top of the sheet. */
  title?: string;
  /** Maximum height of the scrollable content area. */
  maxContentHeight?: number;
  /** Disables outer scrolling when the child already has a scrollable list. */
  contentScrollable?: boolean;
  children: ReactNode;
};

/**
 * App default bottom sheet — same visual language as `QuickActionsFab`: darkened scrim,
 * rounded sheet, shadow, and drag handle.
 *
 * Dumb UI: only presents content and delegates closing via `onClose` (scrim tap).
 * The consumer owns actions/state.
 */
export function BottomSheet({
  visible,
  onClose,
  closeAccessibilityLabel,
  title,
  maxContentHeight = 480,
  contentScrollable = true,
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
        {/* Sheet: Pressable that does not propagate taps so inner touches do not close. */}
        <Pressable onPress={() => undefined}>
          <View
            style={{ backgroundColor: colors.surface, ...shadows.lg }}
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
            {contentScrollable ? (
              <ScrollView
                style={{ maxHeight: maxContentHeight }}
                keyboardShouldPersistTaps="handled"
              >
                <View className="gap-4 px-2 pb-2">{children}</View>
              </ScrollView>
            ) : (
              <View style={{ maxHeight: maxContentHeight }} className="gap-4 px-2 pb-2">
                {children}
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
