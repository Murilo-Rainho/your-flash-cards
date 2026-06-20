import { Pressable, Text } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type SelectableChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
};

/** Selectable chip (e.g. language choice). */
export function SelectableChip({
  label,
  selected,
  onPress,
  accessibilityLabel,
  disabled = false,
}: SelectableChipProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      disabled={disabled}
      onPress={onPress}
      style={{
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.surface : colors.background,
      }}
      className="rounded-xl border px-3 py-2"
    >
      <Text style={{ color: colors.textPrimary }} className="text-sm font-medium">
        {label}
      </Text>
    </Pressable>
  );
}
