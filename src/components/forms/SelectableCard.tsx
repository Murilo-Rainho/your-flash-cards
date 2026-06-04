import { Pressable, Text } from 'react-native';

type SelectableCardProps = {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
};

/** Card selecionável de uma lista de opções (ex.: escolha de coleção). */
export function SelectableCard({
  title,
  subtitle,
  selected,
  onPress,
  accessibilityLabel,
  disabled = false,
}: SelectableCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ selected }}
      disabled={disabled}
      onPress={onPress}
      className={`rounded-xl border p-3 ${
        selected ? 'border-primary bg-surface' : 'border-border bg-background'
      }`}
    >
      <Text className="text-base font-semibold text-textPrimary">{title}</Text>
      {subtitle ? <Text className="mt-1 text-sm text-textSecondary">{subtitle}</Text> : null}
    </Pressable>
  );
}
