import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { FieldError } from '@/components/common/FieldError';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { StateCard } from '@/components/common/StateCard';
import { FormScreen } from '@/components/forms/FormScreen';
import { SelectableCard } from '@/components/forms/SelectableCard';
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
        <View className="gap-3">
          <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
            {strings.decks.collectionLabel}
          </Text>
          <View className="gap-2">
            {collections.map((collection) => (
              <SelectableCard
                key={collection.id}
                title={collection.name}
                subtitle={`${collection.baseLanguage.toUpperCase()} → ${collection.targetLanguage.toUpperCase()}`}
                selected={collection.id === selectedCollectionId}
                disabled={isSaving}
                accessibilityLabel={`${strings.decks.collectionA11yPrefix} ${collection.name}`}
                onPress={() =>
                  setValue('collectionId', collection.id, {
                    shouldDirty: true,
                    shouldValidate: false,
                  })
                }
              />
            ))}
          </View>
          <FieldError message={errors.collectionId?.message} />
        </View>

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
      <ScreenHeader title={strings.decks.newTitle} onBack={goBack} />
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
