import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';

import { Header } from '@/components/common/Header';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { FormScreen } from '@/components/forms/FormScreen';
import { TextAreaField } from '@/components/forms/TextAreaField';
import { TextField } from '@/components/forms/TextField';
import { ROUTES } from '@/constants/routes';
import { LanguagePicker } from '@/features/collections/components/LanguagePicker';
import { useCreateCollection } from '@/features/collections/hooks/useCreateCollection';
import {
  isCreateCollectionInputError,
  type CreateCollectionInput,
} from '@/features/collections/services/createCollection';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';
import { useGoBack } from '@/hooks/useGoBack';
import { applyFieldErrors } from '@/utils/forms';

const defaultValues: CreateCollectionInput = {
  name: '',
  baseLanguage: 'pt',
  targetLanguage: 'en',
  description: '',
};

export function NewCollectionScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const strings = useStrings();
  const { colors } = useTheme();
  const createCollectionMutation = useCreateCollection();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCollectionInput>({ defaultValues });
  const baseLanguage = watch('baseLanguage');
  const targetLanguage = watch('targetLanguage');
  const isSaving = createCollectionMutation.isPending;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await createCollectionMutation.mutateAsync(values);
      router.replace(ROUTES.HOME);
    } catch (error) {
      if (isCreateCollectionInputError(error)) {
        applyFieldErrors(setError, error.fieldErrors);
        return;
      }

      setFormError(strings.collections.createError);
    }
  });

  return (
    <FormScreen>
      <Header variant="page" title={strings.collections.newTitle} onBack={goBack} />

      <Controller
        control={control}
        name="name"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextField
            label={strings.collections.nameLabel}
            value={value}
            placeholder={strings.collections.namePlaceholder}
            error={errors.name?.message}
            disabled={isSaving}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <LanguagePicker
        label={strings.collections.baseLanguageLabel}
        value={baseLanguage}
        disabled={isSaving}
        accessibilityPrefix={strings.collections.baseLanguageLabel}
        error={errors.baseLanguage?.message}
        onChange={(code) =>
          setValue('baseLanguage', code, { shouldDirty: true, shouldValidate: false })
        }
      />

      <LanguagePicker
        label={strings.collections.targetLanguageLabel}
        value={targetLanguage}
        disabled={isSaving}
        accessibilityPrefix={strings.collections.targetLanguageLabel}
        error={errors.targetLanguage?.message}
        onChange={(code) =>
          setValue('targetLanguage', code, { shouldDirty: true, shouldValidate: false })
        }
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextAreaField
            label={strings.collections.descriptionLabel}
            value={value ?? ''}
            placeholder={strings.collections.descriptionPlaceholder}
            error={errors.description?.message}
            disabled={isSaving}
            minHeight={96}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      {formError ? (
        <Text style={{ color: colors.danger }} className="text-sm font-medium">
          {formError}
        </Text>
      ) : null}

      <PrimaryButton
        label={isSaving ? strings.common.saving : strings.collections.saveLabel}
        accessibilityLabel={strings.collections.saveA11y}
        disabled={isSaving}
        onPress={onSubmit}
      />
    </FormScreen>
  );
}
