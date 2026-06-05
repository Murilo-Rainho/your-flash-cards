import { Pressable, Text } from 'react-native';

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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`items-center rounded-xl border border-primary bg-background px-4 py-4 active:bg-surface ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <Text className="text-base font-bold text-primary">{label}</Text>
    </Pressable>
  );
}
