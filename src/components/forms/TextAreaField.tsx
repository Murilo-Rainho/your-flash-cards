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
  const { colors } = useTheme();

  return (
    <View className="gap-2">
      <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        editable={!disabled}
        multiline
        textAlignVertical="top"
        style={{
          minHeight,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          color: colors.textPrimary,
        }}
        className="rounded-xl border px-4 py-3 text-base"
      />
      <FieldError message={error} />
    </View>
  );
}
