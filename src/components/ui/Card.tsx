import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

type CardProps = ViewProps & {
  children: ReactNode;
  className?: string;
};

/** Superfície elevada base: borda + fundo `surface` do tema. */
export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={`rounded-2xl border border-border bg-surface p-4 ${className ?? ''}`}
      {...props}
    >
      {children}
    </View>
  );
}
