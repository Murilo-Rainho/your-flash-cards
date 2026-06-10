import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { FieldError } from '@/components/common/FieldError';
import { withAlpha } from '@/theme/createShadows';
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

/** Campo de texto multilinha com rótulo e erro. */
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
  const backgroundColor = focused ? withAlpha(colors.primary, 0.06) : colors.surface;

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
        editable={!disabled}
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        multiline
        textAlignVertical="top"
        style={{
          minHeight,
          borderColor,
          backgroundColor,
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
