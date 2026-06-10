import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/common/Badge';
import { BottomSheet } from '@/components/common/BottomSheet';
import { FieldError } from '@/components/common/FieldError';
import { Icon } from '@/components/common/Icon';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
  badge?: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  disabled?: boolean;
  error?: string;
  showLabel?: boolean;
  closeAccessibilityLabel?: string;
  onChange: (value: string) => void;
};

/** Campo de seleção genérico (abre lista em modal). */
export function SelectField({
  label,
  value,
  placeholder,
  options,
  disabled = false,
  error,
  showLabel = true,
  closeAccessibilityLabel,
  onChange,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const { colors } = useTheme();
  const selectedOption = options.find((option) => option.value === value);
  const hasValue = Boolean(selectedOption);
  const borderColor = error ? colors.danger : focused || hasValue ? colors.primary : colors.border;
  const valueColor = hasValue ? colors.textPrimary : colors.textSecondary;

  return (
    <View className="gap-2">
      {showLabel ? (
        <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
          {label}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          borderColor,
          backgroundColor: hasValue ? withAlpha(colors.primary, 0.08) : colors.surface,
          opacity: disabled ? 0.5 : 1,
        }}
        className="flex-row items-center gap-3 rounded-2xl border px-4 py-3 active:opacity-90"
      >
        <View className="min-w-0 flex-1">
          <Text style={{ color: valueColor }} className="text-base font-semibold" numberOfLines={1}>
            {selectedOption?.label ?? placeholder}
          </Text>
          {selectedOption?.description ? (
            <Text style={{ color: colors.textSecondary }} className="mt-1 text-sm">
              {selectedOption.description}
            </Text>
          ) : null}
        </View>
        <Icon name="chevron" size={22} tone={disabled ? 'textSecondary' : 'primary'} />
      </Pressable>
      <FieldError message={error} />

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        closeAccessibilityLabel={closeAccessibilityLabel ?? label}
        title={label}
        maxContentHeight={420}
      >
        <View className="gap-1">
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected }}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={{
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? withAlpha(colors.primary, 0.12) : colors.surface,
                }}
                className="rounded-xl border p-3 active:opacity-90"
              >
                <View className="flex-row items-center gap-3">
                  <View className="min-w-0 flex-1">
                    <Text
                      style={{ color: colors.textPrimary }}
                      className="text-base font-semibold"
                      numberOfLines={1}
                    >
                      {option.label}
                    </Text>
                    {option.description ? (
                      <Text style={{ color: colors.textSecondary }} className="mt-1 text-sm">
                        {option.description}
                      </Text>
                    ) : null}
                  </View>
                  {option.badge ? <Badge label={option.badge} tone="secondary" /> : null}
                  {selected ? <Icon name="done" size={20} tone="primary" /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}
