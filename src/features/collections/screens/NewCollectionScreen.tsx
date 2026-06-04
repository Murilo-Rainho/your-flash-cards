import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';

import { PrimaryButton } from '@/components/common/PrimaryButton';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { FormScreen } from '@/components/forms/FormScreen';
import { TextAreaField } from '@/components/forms/TextAreaField';
import { TextField } from '@/components/forms/TextField';
import { ROUTES } from '@/constants/routes';
import { useGoBack } from '@/hooks/useGoBack';
import { applyFieldErrors } from '@/utils/forms';
import { LanguagePicker } from '@/features/collections/components/LanguagePicker';
import { useCreateCollection } from '@/features/collections/hooks/useCreateCollection';
import {
  isCreateCollectionInputError,
  type CreateCollectionInput,
} from '@/features/collections/services/createCollection';

const defaultValues: CreateCollectionInput = {
  name: '',
  baseLanguage: 'pt',
  targetLanguage: 'en',
  description: '',
};

export function NewCollectionScreen() {
  const router = useRouter();
  const goBack = useGoBack();
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

      setFormError('Não foi possível criar a coleção local.');
    }
  });

  return (
    <FormScreen>
      <ScreenHeader title="Nova Coleção" onBack={goBack} />

      <Controller
        control={control}
        name="name"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextField
            label="Nome"
            value={value}
            placeholder="Português para Inglês"
            error={errors.name?.message}
            disabled={isSaving}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <LanguagePicker
        label="Idioma base"
        value={baseLanguage}
        disabled={isSaving}
        accessibilityPrefix="Idioma base"
        error={errors.baseLanguage?.message}
        onChange={(code) =>
          setValue('baseLanguage', code, { shouldDirty: true, shouldValidate: false })
        }
      />

      <LanguagePicker
        label="Idioma alvo"
        value={targetLanguage}
        disabled={isSaving}
        accessibilityPrefix="Idioma alvo"
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
            label="Descrição"
            value={value ?? ''}
            placeholder="Opcional"
            error={errors.description?.message}
            disabled={isSaving}
            minHeight={96}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      {formError ? <Text className="text-sm font-medium text-danger">{formError}</Text> : null}

      <PrimaryButton
        label={isSaving ? 'Salvando...' : 'Salvar coleção'}
        accessibilityLabel="Salvar coleção"
        disabled={isSaving}
        onPress={onSubmit}
      />
    </FormScreen>
  );
}
