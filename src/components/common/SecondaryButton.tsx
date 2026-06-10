import { Pressable, Text } from 'react-native';

import { Icon } from '@/components/common/Icon';
import type { ColorToken } from '@/theme/colors';
import type { IconName } from '@/theme/icons';
import { useTheme } from '@/theme/useTheme';

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  icon?: IconName;
  tone?: ColorToken;
  className?: string;
  compact?: boolean;
};

/** Botão de ação secundária (outline). Mesma assinatura do `PrimaryButton`. */
export function SecondaryButton({
  label,
  onPress,
  accessibilityLabel,
  disabled = false,
  icon,
  tone = 'primary',
  className,
  compact = false,
}: SecondaryButtonProps) {
  const { colors } = useTheme();
  const color = colors[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        borderColor: color,
        backgroundColor: colors.background,
        opacity: disabled ? 0.5 : 1,
      }}
      className={`min-h-14 flex-row items-center justify-center gap-2 rounded-xl border px-4 ${
        compact ? 'py-3' : 'py-4'
      } active:opacity-90 ${className ?? ''}`}
    >
      {icon ? <Icon name={icon} size={18} color={color} /> : null}
      <Text
        style={{ color }}
        className={`text-center ${compact ? 'text-sm' : 'text-base'} font-bold`}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}
