import type { ColorToken } from '@/theme/colors';
import { IconFamily, icons, type IconName } from '@/theme/icons';
import { useTheme } from '@/theme/useTheme';

type IconProps = {
  /** Semantic icon name (resolved via `@/theme/icons`). */
  name: IconName;
  size?: number;
  /** Raw color (takes precedence over `tone`). */
  color?: string;
  /** Theme color token; default `textPrimary`. */
  tone?: ColorToken;
};

/**
 * Single app icon render point. Accepts semantic names and delegates to the
 * family configured in `@/theme/icons` — swapping the library does not require screen changes.
 */
export function Icon({ name, size = 20, color, tone }: IconProps) {
  const { colors } = useTheme();
  const resolvedColor = color ?? (tone ? colors[tone] : colors.textPrimary);

  return <IconFamily name={icons[name]} size={size} color={resolvedColor} />;
}
