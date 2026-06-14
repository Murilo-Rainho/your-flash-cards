import { useEffect, useState, type ReactNode } from 'react';
import { Keyboard, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/useTheme';

type FormScreenProps = {
  children: ReactNode;
  contentClassName?: string;
};

/**
 * Altura atual do teclado (0 quando fechado). Necessária no Android porque, com
 * edge-to-edge (padrão no SDK 54), a janela não é mais redimensionada
 * automaticamente ao abrir o teclado — o conteúdo de baixo ficaria inacessível.
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
 * Scaffold compartilhado das telas de formulário: SafeArea + ScrollView que
 * acompanha o teclado, permitindo rolar até o fim mesmo com o teclado aberto.
 * iOS: insets automáticos do ScrollView. Android: padding dinâmico (edge-to-edge).
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
