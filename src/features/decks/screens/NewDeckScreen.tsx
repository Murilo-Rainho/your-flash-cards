import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Header } from '@/components/common/Header';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { StateCard } from '@/components/common/StateCard';
import { FormScreen } from '@/components/forms/FormScreen';
import { SelectField, type SelectOption } from '@/components/forms/SelectField';
import { TextAreaField } from '@/components/forms/TextAreaField';
import { TextField } from '@/components/forms/TextField';
import { ROUTES } from '@/constants/routes';
import type { Collection } from '@/domain/entities/Collection';
import { useActiveCollections } from '@/features/collections/hooks/useActiveCollections';
import { useCreateDeck } from '@/features/decks/hooks/useCreateDeck';
import { isCreateDeckInputError, type CreateDeckInput } from '@/features/decks/services/createDeck';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';
import { useGoBack } from '@/hooks/useGoBack';
import { applyFieldErrors } from '@/utils/forms';

const defaultValues: CreateDeckInput = {
  collectionId: '',
  name: '',
  description: '',
  autoGenerateReverseCards: false,
};

const emptyCollections: Collection[] = [];

export function NewDeckScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const strings = useStrings();
  const { colors } = useTheme();
  const activeCollectionsQuery = useActiveCollections();
  const createDeckMutation = useCreateDeck();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateDeckInput>({ defaultValues });
  const collections = activeCollectionsQuery.data ?? emptyCollections;
  const selectedCollectionId = watch('collectionId');
  const collectionOptions = collections.map<SelectOption>((collection) => ({
    value: collection.id,
    label: collection.name,
    description: `${collection.baseLanguage.toUpperCase()} -> ${collection.targetLanguage.toUpperCase()}`,
  }));
  const isSaving = createDeckMutation.isPending;
  const isFormDisabled = isSaving || activeCollectionsQuery.isLoading || collections.length === 0;

  useEffect(() => {
    if (!selectedCollectionId && collections[0]) {
      setValue('collectionId', collections[0].id, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [collections, selectedCollectionId, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await createDeckMutation.mutateAsync(values);
      router.replace(ROUTES.HOME);
    } catch (error) {
      if (isCreateDeckInputError(error)) {
        applyFieldErrors(setError, error.fieldErrors);
        return;
      }

      setFormError(strings.decks.createError);
    }
  });

  const renderBody = () => {
    if (activeCollectionsQuery.isLoading) {
      return (
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          {strings.decks.loadingCollections}
        </Text>
      );
    }

    if (activeCollectionsQuery.error) {
      return (
        <StateCard
          title={strings.decks.loadCollectionsError}
          action={{
            label: strings.common.retry,
            accessibilityLabel: strings.decks.loadCollectionsRetryA11y,
            variant: 'secondary',
            onPress: () => {
              void activeCollectionsQuery.refetch();
            },
          }}
        />
      );
    }

    if (collections.length === 0) {
      return (
        <StateCard
          title={strings.decks.noCollections}
          action={{
            label: strings.decks.createCollection,
            accessibilityLabel: strings.decks.createCollectionA11y,
            onPress: () => router.replace(ROUTES.COLLECTION_NEW),
          }}
        />
      );
    }

    return (
      <>
        <SelectField
          label={strings.decks.collectionLabel}
          value={selectedCollectionId}
          placeholder={strings.decks.collectionPlaceholder}
          disabled={isSaving}
          options={collectionOptions}
          error={errors.collectionId?.message}
          onChange={(collectionId) =>
            setValue('collectionId', collectionId, {
              shouldDirty: true,
              shouldValidate: false,
            })
          }
        />

        <Controller
          control={control}
          name="name"
          render={({ field: { onBlur, onChange, value } }) => (
            <TextField
              label={strings.decks.nameLabel}
              value={value}
              placeholder={strings.decks.namePlaceholder}
              error={errors.name?.message}
              disabled={isSaving}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onBlur, onChange, value } }) => (
            <TextAreaField
              label={strings.decks.descriptionLabel}
              value={value ?? ''}
              placeholder={strings.decks.descriptionPlaceholder}
              error={errors.description?.message}
              disabled={isSaving}
              minHeight={96}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />

        <View
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
          className="flex-row items-center justify-between gap-4 rounded-xl border p-4"
        >
          <View className="flex-1">
            <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
              {strings.decks.reverseCardsLabel}
            </Text>
            <Text style={{ color: colors.textSecondary }} className="mt-1 text-sm">
              {strings.decks.reverseCardsHint}
            </Text>
          </View>
          <Controller
            control={control}
            name="autoGenerateReverseCards"
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value}
                disabled={isSaving}
                onValueChange={onChange}
                trackColor={{ false: colors.border, true: colors.secondary }}
                thumbColor={colors.background}
              />
            )}
          />
        </View>
      </>
    );
  };

  return (
    <FormScreen>
      <Header variant="page" title={strings.decks.newTitle} onBack={goBack} />
      {renderBody()}

      {formError ? (
        <Text style={{ color: colors.danger }} className="text-sm font-medium">
          {formError}
        </Text>
      ) : null}

      <PrimaryButton
        label={isSaving ? strings.common.saving : strings.decks.saveLabel}
        accessibilityLabel={strings.decks.saveA11y}
        disabled={isFormDisabled}
        onPress={onSubmit}
      />
    </FormScreen>
  );
}
