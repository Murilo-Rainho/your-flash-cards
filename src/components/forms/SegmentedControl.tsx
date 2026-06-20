import { Pressable, Text, View } from 'react-native';

import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

export type SegmentedControlOption<TValue extends string> = {
  value: TValue;
  label: string;
  accessibilityLabel?: string;
};

type SegmentedControlProps<TValue extends string> = {
  value: TValue;
  options: Array<SegmentedControlOption<TValue>>;
  onChange: (value: TValue) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

/** Compact segmented control for short mutually exclusive choices. */
export function SegmentedControl<TValue extends string>({
  value,
  options,
  onChange,
  disabled = false,
  accessibilityLabel,
}: SegmentedControlProps<TValue>) {
  const { colors } = useTheme();

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radiogroup"
      style={{ borderColor: colors.border, backgroundColor: colors.background }}
      className="flex-row rounded-lg border p-1"
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={{
              backgroundColor: selected ? withAlpha(colors.primary, 0.16) : colors.background,
            }}
            className="min-w-16 items-center rounded-md px-2 py-2 active:opacity-90"
          >
            <Text
              style={{ color: selected ? colors.primary : colors.textSecondary }}
              className="text-xs font-bold"
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
