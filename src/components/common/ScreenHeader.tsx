import { Pressable, Text, View } from 'react-native';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
};

/** Cabeçalho de tela com botão "Voltar" e título (subtítulo opcional para etapas). */
export function ScreenHeader({ title, subtitle, onBack }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={onBack}
        className="rounded-xl border border-border px-4 py-3 active:bg-surface"
      >
        <Text className="text-base font-semibold text-textPrimary">Voltar</Text>
      </Pressable>
      {subtitle ? (
        <View className="flex-1 items-end">
          <Text className="text-2xl font-bold text-textPrimary">{title}</Text>
          <Text className="mt-1 text-sm text-textSecondary">{subtitle}</Text>
        </View>
      ) : (
        <Text className="flex-1 text-right text-2xl font-bold text-textPrimary">{title}</Text>
      )}
    </View>
  );
}
