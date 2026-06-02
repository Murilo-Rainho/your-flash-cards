import type { ReactNode } from 'react';
import { View } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = {
  children: ReactNode;
  /** Classes extras aplicadas ao container interno. */
  className?: string;
  /** Bordas seguras respeitadas (padrão: topo e base). */
  edges?: readonly Edge[];
};

/** Wrapper padrão de tela: área segura + fundo do tema + padding horizontal. */
export function Screen({ children, className, edges = ['top', 'bottom'] }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-background">
      <View className={`flex-1 px-4 ${className ?? ''}`}>{children}</View>
    </SafeAreaView>
  );
}
