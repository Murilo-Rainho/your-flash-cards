import { Pressable, Text } from 'react-native';

type SelectableChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
};

/** Chip selecionável (ex.: escolha de idioma). */
export function SelectableChip({
  label,
  selected,
  onPress,
  accessibilityLabel,
  disabled = false,
}: SelectableChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      disabled={disabled}
      onPress={onPress}
      className={`rounded-xl border px-3 py-2 ${
        selected ? 'border-primary bg-surface' : 'border-border bg-background'
      }`}
    >
      <Text className="text-sm font-medium text-textPrimary">{label}</Text>
    </Pressable>
  );
}
