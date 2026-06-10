import { useState } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

import { FieldError } from '@/components/common/FieldError';
import { useTheme } from '@/theme/useTheme';

type TextFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  disabled?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  onChangeText: (value: string) => void;
  onBlur?: () => void;
};

/** Campo de texto de linha única com rótulo e erro. */
export function TextField({
  label,
  value,
  placeholder,
  error,
  disabled = false,
  autoCapitalize,
  onChangeText,
  onBlur,
}: TextFieldProps) {
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
        autoCapitalize={autoCapitalize}
        style={{
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
