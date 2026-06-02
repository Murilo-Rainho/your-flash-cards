/**
 * Paleta de cores — fonte única de verdade do tema (claro).
 *
 * Consumida de duas formas:
 *  - Em TS/JS: `import { colors } from '@/theme'` (valores brutos).
 *  - Pelo NativeWind/Tailwind: `tailwind.config.ts` importa este arquivo e gera
 *    as classes (`bg-primary`, `text-textSecondary`, `border-border`, ...).
 *
 * Tema CLARO, com foco em leitura, estudo e acessibilidade.
 * Para re-tematizar o app inteiro, altere apenas os valores aqui.
 */
export const colors = {
  primary: '#2563EB',
  secondary: '#14B8A6',

  background: '#FFFFFF',
  surface: '#F8FAFC',

  textPrimary: '#0F172A',
  textSecondary: '#475569',

  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',

  border: '#E2E8F0',
} as const;

export type Colors = typeof colors;
export type ColorToken = keyof Colors;
