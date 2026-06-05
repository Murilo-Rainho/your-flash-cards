import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { FieldError } from '@/components/common/FieldError';
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
  onChange,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const { colors, shadows } = useTheme();
  const selectedOption = options.find((option) => option.value === value);

  return (
    <View className="gap-2">
      <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={{
          borderColor: colors.border,
          backgroundColor: colors.surface,
          opacity: disabled ? 0.5 : 1,
        }}
        className="rounded-xl border px-4 py-3 active:opacity-90"
      >
        <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
          {selectedOption?.label ?? placeholder}
        </Text>
        {selectedOption?.description ? (
          <Text style={{ color: colors.textSecondary }} className="mt-1 text-sm">
            {selectedOption.description}
          </Text>
        ) : null}
      </Pressable>
      <FieldError message={error} />

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Fechar ${label}`}
          onPress={() => setOpen(false)}
          style={{ backgroundColor: `${colors.textPrimary}66` }}
          className="flex-1 justify-end p-4"
        >
          <View
            style={{ backgroundColor: colors.background, ...shadows.lg }}
            className="rounded-xl p-2"
          >
            <Text style={{ color: colors.textPrimary }} className="px-3 py-2 text-base font-bold">
              {label}
            </Text>
            <ScrollView style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled">
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
                    style={{ backgroundColor: selected ? colors.surface : colors.background }}
                    className="rounded-xl p-3 active:opacity-90"
                  >
                    <View className="flex-row items-center gap-2">
                      <Text
                        style={{ color: colors.textPrimary }}
                        className="flex-1 text-base font-semibold"
                      >
                        {option.label}
                      </Text>
                      {option.badge ? (
                        <View
                          style={{ backgroundColor: colors.secondary }}
                          className="rounded-lg px-2 py-1"
                        >
                          <Text style={{ color: colors.background }} className="text-xs font-bold">
                            {option.badge}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    {option.description ? (
                      <Text style={{ color: colors.textSecondary }} className="mt-1 text-sm">
                        {option.description}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
