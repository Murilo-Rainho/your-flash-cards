import { SelectField, type SelectOption } from '@/components/forms/SelectField';
import { LANGUAGES, type LanguageCode } from '@/constants/languages';

type LanguagePickerProps = {
  label: string;
  value: LanguageCode;
  onChange: (code: LanguageCode) => void;
  accessibilityPrefix: string;
  error?: string;
  disabled?: boolean;
};

const languageOptions = LANGUAGES.map<SelectOption>((language) => ({
  value: language.code,
  label: language.label,
  badge: language.code.toUpperCase(),
}));

/** Language selection (base/target) using the app shared SelectField. */
export function LanguagePicker({
  label,
  value,
  onChange,
  accessibilityPrefix,
  error,
  disabled = false,
}: LanguagePickerProps) {
  return (
    <SelectField
      label={label}
      value={value}
      placeholder={label}
      options={languageOptions}
      disabled={disabled}
      error={error}
      closeAccessibilityLabel={accessibilityPrefix}
      onChange={(code) => onChange(code as LanguageCode)}
    />
  );
}
