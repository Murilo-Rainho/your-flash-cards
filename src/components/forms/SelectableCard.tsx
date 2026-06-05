import { Pressable, Text } from 'react-native';

import { useTheme } from '@/theme/useTheme';

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
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ selected }}
      disabled={disabled}
      onPress={onPress}
      style={{
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.surface : colors.background,
      }}
      className="rounded-xl border p-3"
    >
      <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ color: colors.textSecondary }} className="mt-1 text-sm">
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}
