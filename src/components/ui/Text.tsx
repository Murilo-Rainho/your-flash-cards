import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

const variants = {
  title: 'text-3xl font-bold text-content-primary',
  subtitle: 'text-lg font-semibold text-content-primary',
  body: 'text-base text-content-primary',
  caption: 'text-sm text-content-secondary',
} as const;

export type TextVariant = keyof typeof variants;

type TextProps = RNTextProps & {
  variant?: TextVariant;
  className?: string;
};

/** Texto base do app. Já aplica cor/typografia do tema por variante. */
export function Text({ variant = 'body', className, ...props }: TextProps) {
  return <RNText className={`${variants[variant]} ${className ?? ''}`} {...props} />;
}
