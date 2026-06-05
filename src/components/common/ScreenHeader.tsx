import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
};

/** Cabeçalho de tela com botão "Voltar" e título (subtítulo opcional para etapas). */
export function ScreenHeader({ title, subtitle, onBack }: ScreenHeaderProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center justify-between gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={onBack}
        style={{ borderColor: colors.border }}
        className="rounded-xl border px-4 py-3 active:opacity-90"
      >
        <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
          Voltar
        </Text>
      </Pressable>
      {subtitle ? (
        <View className="flex-1 items-end">
          <Text style={{ color: colors.textPrimary }} className="text-2xl font-bold">
            {title}
          </Text>
          <Text style={{ color: colors.textSecondary }} className="mt-1 text-sm">
            {subtitle}
          </Text>
        </View>
      ) : (
        <Text
          style={{ color: colors.textPrimary }}
          className="flex-1 text-right text-2xl font-bold"
        >
          {title}
        </Text>
      )}
    </View>
  );
}
