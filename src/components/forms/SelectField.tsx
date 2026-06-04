import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { FieldError } from '@/components/common/FieldError';
import { shadows } from '@/theme';

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
  const selectedOption = options.find((option) => option.value === value);

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-textPrimary">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={`rounded-xl border border-border bg-surface px-4 py-3 active:bg-background ${
          disabled ? 'opacity-50' : ''
        }`}
      >
        <Text className="text-base font-semibold text-textPrimary">
          {selectedOption?.label ?? placeholder}
        </Text>
        {selectedOption?.description ? (
          <Text className="mt-1 text-sm text-textSecondary">{selectedOption.description}</Text>
        ) : null}
      </Pressable>
      <FieldError message={error} />

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Fechar ${label}`}
          onPress={() => setOpen(false)}
          className="flex-1 justify-end bg-textPrimary/40 p-4"
        >
          <View style={shadows.lg} className="rounded-xl bg-background p-2">
            <Text className="px-3 py-2 text-base font-bold text-textPrimary">{label}</Text>
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
                    className={`rounded-xl p-3 active:bg-surface ${
                      selected ? 'bg-surface' : 'bg-background'
                    }`}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="flex-1 text-base font-semibold text-textPrimary">
                        {option.label}
                      </Text>
                      {option.badge ? (
                        <View className="rounded-lg bg-secondary px-2 py-1">
                          <Text className="text-xs font-bold text-background">{option.badge}</Text>
                        </View>
                      ) : null}
                    </View>
                    {option.description ? (
                      <Text className="mt-1 text-sm text-textSecondary">{option.description}</Text>
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
