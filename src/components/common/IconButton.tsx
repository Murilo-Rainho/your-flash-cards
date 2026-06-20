import { Pressable } from 'react-native';

import { Icon } from '@/components/common/Icon';
import type { ColorToken } from '@/theme/colors';
import type { IconName } from '@/theme/icons';
import { useTheme } from '@/theme/useTheme';

type IconButtonProps = {
  /** Semantic icon (resolved via `@/theme/icons`). */
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  /** Icon color token; default `textPrimary` (use `danger` for destructive actions). */
  tone?: ColorToken;
  disabled?: boolean;
};

/**
 * Compact circular action button — same pattern as back/menu buttons in `Header`.
 * Dumb UI primitive for icon actions (edit, delete) without hard-coded colors.
 */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  tone = 'textPrimary',
  disabled = false,
}: IconButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        borderColor: colors.border,
        backgroundColor: colors.surface,
        opacity: disabled ? 0.5 : 1,
      }}
      className="h-10 w-10 items-center justify-center rounded-full border active:opacity-90"
    >
      <Icon name={icon} tone={tone} />
    </Pressable>
  );
}
