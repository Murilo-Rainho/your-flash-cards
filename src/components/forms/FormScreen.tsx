import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme';

type FormScreenProps = {
  children: ReactNode;
  contentClassName?: string;
};

/**
 * Scaffold compartilhado das telas de formulário: SafeArea + KeyboardAvoidingView + ScrollView.
 */
export function FormScreen({
  children,
  contentClassName = 'gap-6 px-4 pb-10 pt-2',
}: FormScreenProps) {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className={contentClassName}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
