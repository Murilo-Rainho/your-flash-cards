import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { FieldError } from '@/components/common/FieldError';
import { useTheme } from '@/theme/useTheme';

type TextAreaFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  disabled?: boolean;
  minHeight?: number;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
};

/** Multiline text field with label and error. */
export function TextAreaField({
  label,
  value,
  placeholder,
  error,
  disabled = false,
  minHeight = 112,
  onChangeText,
  onBlur,
}: TextAreaFieldProps) {
  const { colors, shadows } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View className="gap-2">
      <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.primary}
        selectionHandleColor={colors.primary}
        cursorColor={colors.primary}
        underlineColorAndroid="transparent"
        editable={!disabled}
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        multiline
        textAlignVertical="top"
        style={{
          minHeight,
          borderColor,
          backgroundColor: colors.surface,
          color: colors.textPrimary,
          opacity: disabled ? 0.5 : 1,
          ...shadows.sm,
        }}
        className="rounded-2xl border px-4 py-3 text-base"
      />
      <FieldError message={error} />
    </View>
  );
}
