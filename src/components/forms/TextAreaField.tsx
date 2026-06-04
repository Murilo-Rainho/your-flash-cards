import { Text, TextInput, View } from 'react-native';

import { FieldError } from '@/components/common/FieldError';
import { colors } from '@/theme';

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
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-textPrimary">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        editable={!disabled}
        multiline
        textAlignVertical="top"
        style={{ minHeight }}
        className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-textPrimary"
      />
      <FieldError message={error} />
    </View>
  );
}
