/**
 * Theme tokens — fonte única de verdade do design system do app.
 *
 * Altere os valores AQUI para re-tematizar o app inteiro de uma vez:
 *   - As classes do Tailwind/NativeWind (`bg-background`, `text-content-primary`, ...)
 *     são geradas a partir de `light` (ver tailwind.config.js).
 *   - O código TS consome os valores brutos via `@/theme` (ver src/theme/index.ts).
 *
 * Mantido como CommonJS (.js) de propósito: o tailwind.config.js roda em Node e
 * precisa conseguir `require()` deste arquivo. Os tipos vêm de `tokens.d.ts`.
 */

const palette = {
  white: '#FFFFFF',
  black: '#000000',
};

/** Paleta semântica do tema claro (padrão atual do app). */
const light = {
  primary: { DEFAULT: '#2563EB', foreground: '#FFFFFF' },
  background: { DEFAULT: '#F9FAFB', secondary: '#F3F4F6' },
  surface: '#FFFFFF',
  border: '#E5E7EB',
  content: { primary: '#111827', secondary: '#6B7280' },
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
  income: '#16A34A',
  expense: '#DC2626',
};

/** Paleta semântica do tema escuro (pronta para uso futuro). */
const dark = {
  primary: { DEFAULT: '#3B82F6', foreground: '#FFFFFF' },
  background: { DEFAULT: '#0B1120', secondary: '#111827' },
  surface: '#1F2937',
  border: '#374151',
  content: { primary: '#F9FAFB', secondary: '#9CA3AF' },
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  income: '#22C55E',
  expense: '#EF4444',
};

/** Raios de borda (em px) usados em cartões, botões, inputs. */
const radius = { sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 9999 };

/** Espaçamentos base (em px) para padding/gap consistentes. */
const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

/** Tamanhos de fonte (em px). */
const fontSize = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30 };

module.exports = {
  palette,
  light,
  dark,
  radius,
  spacing,
  fontSize,
  /** Tema ativo. Troque para `dark` aqui se quiser inverter o padrão global. */
  colors: light,
};
