import { Pressable, Text } from 'react-native';

import { Icon } from '@/components/common/Icon';
import type { IconName } from '@/theme/icons';
import { useTheme } from '@/theme/useTheme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  icon?: IconName;
  className?: string;
  compact?: boolean;
};

/** Botão de ação primária (submit). Aplica estado desabilitado/opaco padrão das telas. */
export function PrimaryButton({
  label,
  onPress,
  accessibilityLabel,
  disabled = false,
  icon,
  className,
  compact = false,
}: PrimaryButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{ backgroundColor: colors.primary, opacity: disabled ? 0.5 : 1 }}
      className={`min-h-14 flex-row items-center justify-center gap-2 rounded-xl px-4 ${
        compact ? 'py-3' : 'py-4'
      } active:opacity-90 ${className ?? ''}`}
    >
      {icon ? <Icon name={icon} size={18} color={colors.background} /> : null}
      <Text
        style={{ color: colors.background }}
        className={`text-center ${compact ? 'text-sm' : 'text-base'} font-bold`}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}
