import { Pressable } from 'react-native';

import { Icon } from '@/components/common/Icon';
import type { ColorToken } from '@/theme/colors';
import type { IconName } from '@/theme/icons';
import { useTheme } from '@/theme/useTheme';

type IconButtonProps = {
  /** Ícone semântico (resolvido via `@/theme/icons`). */
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  /** Token de cor do ícone; default `textPrimary` (use `danger` para ações destrutivas). */
  tone?: ColorToken;
  disabled?: boolean;
};

/**
 * Botão de ação compacto e circular — mesmo padrão dos botões de voltar/menu do `Header`.
 * Primitivo de UI burro para ações de ícone (editar, excluir) sem cores hardcoded.
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
