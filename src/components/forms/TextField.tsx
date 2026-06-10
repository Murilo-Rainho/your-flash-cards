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
        autoCapitalize={autoCapitalize}
        style={{
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
