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
import { colors } from '@/theme';
import { useGoBack } from '@/hooks/useGoBack';
import { applyFieldErrors } from '@/utils/forms';
import { useActiveCollections } from '@/features/collections/hooks/useActiveCollections';
import { useCreateDeck } from '@/features/decks/hooks/useCreateDeck';
import { isCreateDeckInputError, type CreateDeckInput } from '@/features/decks/services/createDeck';

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

      setFormError('Não foi possível criar o deck local.');
    }
  });

  const renderBody = () => {
    if (activeCollectionsQuery.isLoading) {
      return <Text className="text-sm text-textSecondary">Carregando coleções locais...</Text>;
    }

    if (activeCollectionsQuery.error) {
      return (
        <StateCard
          title="Não foi possível carregar as coleções"
          action={{
            label: 'Tentar novamente',
            accessibilityLabel: 'Tentar carregar coleções novamente',
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
          title="Nenhuma coleção criada ainda"
          action={{
            label: 'Criar coleção',
            accessibilityLabel: 'Criar coleção',
            onPress: () => router.replace(ROUTES.COLLECTION_NEW),
          }}
        />
      );
    }

    return (
      <>
        <View className="gap-3">
          <Text className="text-sm font-semibold text-textPrimary">Coleção</Text>
          <View className="gap-2">
            {collections.map((collection) => (
              <SelectableCard
                key={collection.id}
                title={collection.name}
                subtitle={`${collection.baseLanguage.toUpperCase()} → ${collection.targetLanguage.toUpperCase()}`}
                selected={collection.id === selectedCollectionId}
                disabled={isSaving}
                accessibilityLabel={`Coleção ${collection.name}`}
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
              label="Nome"
              value={value}
              placeholder="Travel"
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

        <View className="flex-row items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4">
          <View className="flex-1">
            <Text className="text-base font-semibold text-textPrimary">
              Cards reversos automáticos
            </Text>
            <Text className="mt-1 text-sm text-textSecondary">Gerar reverso ao criar cards</Text>
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
      <ScreenHeader title="Novo Deck" onBack={goBack} />
      {renderBody()}

      {formError ? <Text className="text-sm font-medium text-danger">{formError}</Text> : null}

      <PrimaryButton
        label={isSaving ? 'Salvando...' : 'Salvar deck'}
        accessibilityLabel="Salvar deck"
        disabled={isFormDisabled}
        onPress={onSubmit}
      />
    </FormScreen>
  );
}
