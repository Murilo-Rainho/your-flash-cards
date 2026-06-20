import { useEffect, useState, type ReactNode } from 'react';
import { Keyboard, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/useTheme';

type FormScreenProps = {
  children: ReactNode;
  contentClassName?: string;
};

/**
 * Current keyboard height (0 when closed). Required on Android because, with
 * edge-to-edge (default on SDK 54), the window is no longer resized automatically
 * when the keyboard opens — bottom content would become unreachable.
 */
function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => setHeight(event.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setHeight(0),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return height;
}

/**
 * Shared scaffold for form screens: SafeArea + ScrollView that
 * follows the keyboard, allowing scroll to the bottom even with the keyboard open.
 * iOS: automatic ScrollView insets. Android: dynamic padding (edge-to-edge).
 */
export function FormScreen({
  children,
  contentClassName = 'gap-6 px-4 pb-10 pt-2',
}: FormScreenProps) {
  const { colors } = useTheme();
  const keyboardHeight = useKeyboardHeight();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        contentContainerStyle={
          Platform.OS === 'android' ? { paddingBottom: keyboardHeight } : undefined
        }
      >
        <View className={contentClassName}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
