import { Pressable, type PressableProps } from 'react-native';
import { Text } from './Text';

const containerVariants = {
  primary: 'bg-primary',
  secondary: 'bg-background-secondary border border-border',
  danger: 'bg-danger',
} as const;

const labelVariants = {
  primary: 'text-primary-foreground',
  secondary: 'text-content-primary',
  danger: 'text-white',
} as const;

export type ButtonVariant = keyof typeof containerVariants;

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  className?: string;
};

/** Botão base do app, estilizado a partir do tema. */
export function Button({ label, variant = 'primary', className, disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={`h-12 items-center justify-center rounded-xl px-4 active:opacity-80 ${
        containerVariants[variant]
      } ${disabled ? 'opacity-50' : ''} ${className ?? ''}`}
      {...props}
    >
      <Text className={`text-base font-semibold ${labelVariants[variant]}`}>{label}</Text>
    </Pressable>
  );
}
