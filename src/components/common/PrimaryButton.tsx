import { Pressable, Text } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
};

/** Botão de ação primária (submit). Aplica estado desabilitado/opaco padrão das telas. */
export function PrimaryButton({
  label,
  onPress,
  accessibilityLabel,
  disabled = false,
}: PrimaryButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{ backgroundColor: colors.primary, opacity: disabled ? 0.5 : 1 }}
      className="items-center rounded-xl px-4 py-4 active:opacity-90"
    >
      <Text style={{ color: colors.background }} className="text-base font-bold">
        {label}
      </Text>
    </Pressable>
  );
}
