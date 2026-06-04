import { Text, TextInput, View } from 'react-native';

import { FieldError } from '@/components/common/FieldError';
import { colors } from '@/theme';

type TextFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  disabled?: boolean;
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
  onChangeText,
  onBlur,
}: TextFieldProps) {
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
        className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-textPrimary"
      />
      <FieldError message={error} />
    </View>
  );
}
