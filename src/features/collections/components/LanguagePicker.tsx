import { Text, View } from 'react-native';

import { FieldError } from '@/components/common/FieldError';
import { SelectableChip } from '@/components/forms/SelectableChip';
import { LANGUAGES, type LanguageCode } from '@/constants/languages';

type LanguagePickerProps = {
  label: string;
  value: LanguageCode;
  onChange: (code: LanguageCode) => void;
  accessibilityPrefix: string;
  error?: string;
  disabled?: boolean;
};

/** Seleção de idioma (base/alvo) por chips, a partir de `LANGUAGES`. */
export function LanguagePicker({
  label,
  value,
  onChange,
  accessibilityPrefix,
  error,
  disabled = false,
}: LanguagePickerProps) {
  return (
    <View className="gap-3">
      <Text className="text-sm font-semibold text-textPrimary">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {LANGUAGES.map((language) => (
          <SelectableChip
            key={language.code}
            label={language.label}
            selected={language.code === value}
            disabled={disabled}
            accessibilityLabel={`${accessibilityPrefix} ${language.label}`}
            onPress={() => onChange(language.code)}
          />
        ))}
      </View>
      <FieldError message={error} />
    </View>
  );
}
