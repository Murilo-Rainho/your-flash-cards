export interface ThemeColors {
  primary: { DEFAULT: string; foreground: string };
  background: { DEFAULT: string; secondary: string };
  surface: string;
  border: string;
  content: { primary: string; secondary: string };
  success: string;
  danger: string;
  warning: string;
  income: string;
  expense: string;
}

export const palette: { white: string; black: string };
export const light: ThemeColors;
export const dark: ThemeColors;
export const colors: ThemeColors;
export const radius: Record<'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full', number>;
export const spacing: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>;
export const fontSize: Record<'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl', number>;
