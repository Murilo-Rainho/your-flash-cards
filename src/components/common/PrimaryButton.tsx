import { Pressable, Text } from 'react-native';

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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`items-center rounded-xl bg-primary px-4 py-4 active:opacity-90 ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <Text className="text-base font-bold text-background">{label}</Text>
    </Pressable>
  );
}
