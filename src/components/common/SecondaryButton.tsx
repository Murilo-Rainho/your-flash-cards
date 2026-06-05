import { Pressable, Text } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
};

/** Botão de ação secundária (outline). Mesma assinatura do `PrimaryButton`. */
export function SecondaryButton({
  label,
  onPress,
  accessibilityLabel,
  disabled = false,
}: SecondaryButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        borderColor: colors.primary,
        backgroundColor: colors.background,
        opacity: disabled ? 0.5 : 1,
      }}
      className="items-center rounded-xl border px-4 py-4 active:opacity-90"
    >
      <Text style={{ color: colors.primary }} className="text-base font-bold">
        {label}
      </Text>
    </Pressable>
  );
}
