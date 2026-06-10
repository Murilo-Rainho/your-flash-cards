import type { ColorToken } from '@/theme/colors';
import { IconFamily, icons, type IconName } from '@/theme/icons';
import { useTheme } from '@/theme/useTheme';

type IconProps = {
  /** Nome semântico do ícone (resolvido via `@/theme/icons`). */
  name: IconName;
  size?: number;
  /** Cor crua (tem prioridade sobre `tone`). */
  color?: string;
  /** Token de cor do tema; default `textPrimary`. */
  tone?: ColorToken;
};

/**
 * Único ponto de render de ícones do app. Recebe nomes semânticos e delega à
 * família configurada em `@/theme/icons` — trocar a lib não exige mudar telas.
 */
export function Icon({ name, size = 20, color, tone }: IconProps) {
  const { colors } = useTheme();
  const resolvedColor = color ?? (tone ? colors[tone] : colors.textPrimary);

  return <IconFamily name={icons[name]} size={size} color={resolvedColor} />;
}
