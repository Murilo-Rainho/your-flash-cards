import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ROUTES } from '@/constants/routes';
import type { Collection } from '@/domain/entities/Collection';
import { colors } from '@/theme';
import { useActiveCollections } from '@/features/collections/hooks/useActiveCollections';
import { useCreateDeck } from '@/features/decks/hooks/useCreateDeck';
import {
  isCreateDeckInputError,
  type CreateDeckField,
  type CreateDeckInput,
} from '@/features/decks/services/createDeck';

const defaultValues: CreateDeckInput = {
  collectionId: '',
  name: '',
  description: '',
  autoGenerateReverseCards: false,
};

const emptyCollections: Collection[] = [];

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <Text className="text-sm text-danger">{message}</Text>;
}

export function NewDeckScreen() {
  const router = useRouter();
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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(ROUTES.HOME);
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await createDeckMutation.mutateAsync(values);
      router.replace(ROUTES.HOME);
    } catch (error) {
      if (isCreateDeckInputError(error)) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          if (message) {
            setError(field as CreateDeckField, { message });
          }
        });
        return;
      }

      setFormError('Não foi possível criar o deck local.');
    }
  });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="gap-6 px-4 pb-10 pt-2">
            <View className="flex-row items-center justify-between gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                onPress={handleBack}
                className="rounded-xl border border-border px-4 py-3 active:bg-surface"
              >
                <Text className="text-base font-semibold text-textPrimary">Voltar</Text>
              </Pressable>
              <Text className="flex-1 text-right text-2xl font-bold text-textPrimary">
                Novo Deck
              </Text>
            </View>

            {activeCollectionsQuery.isLoading ? (
              <Text className="text-sm text-textSecondary">Carregando coleções locais...</Text>
            ) : activeCollectionsQuery.error ? (
              <View className="gap-3 rounded-xl border border-border bg-surface p-4">
                <Text className="text-base font-semibold text-textPrimary">
                  Não foi possível carregar as coleções
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Tentar carregar coleções novamente"
                  onPress={() => {
                    void activeCollectionsQuery.refetch();
                  }}
                  className="items-center rounded-xl border border-border bg-background px-4 py-3 active:bg-surface"
                >
                  <Text className="text-base font-semibold text-textPrimary">Tentar novamente</Text>
                </Pressable>
              </View>
            ) : collections.length === 0 ? (
              <View className="gap-3 rounded-xl border border-border bg-surface p-4">
                <Text className="text-base font-semibold text-textPrimary">
                  Nenhuma coleção criada ainda
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Criar coleção"
                  onPress={() => router.replace(ROUTES.COLLECTION_NEW)}
                  className="items-center rounded-xl bg-primary px-4 py-3 active:opacity-90"
                >
                  <Text className="text-base font-bold text-background">Criar coleção</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View className="gap-3">
                  <Text className="text-sm font-semibold text-textPrimary">Coleção</Text>
                  <View className="gap-2">
                    {collections.map((collection) => {
                      const selected = collection.id === selectedCollectionId;
                      const languagePair = `${collection.baseLanguage.toUpperCase()} → ${collection.targetLanguage.toUpperCase()}`;

                      return (
                        <Pressable
                          key={collection.id}
                          accessibilityRole="button"
                          accessibilityLabel={`Coleção ${collection.name}`}
                          accessibilityState={{ selected }}
                          disabled={isSaving}
                          onPress={() =>
                            setValue('collectionId', collection.id, {
                              shouldDirty: true,
                              shouldValidate: false,
                            })
                          }
                          className={`rounded-xl border p-3 ${
                            selected ? 'border-primary bg-surface' : 'border-border bg-background'
                          }`}
                        >
                          <Text className="text-base font-semibold text-textPrimary">
                            {collection.name}
                          </Text>
                          <Text className="mt-1 text-sm text-textSecondary">{languagePair}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <FieldError message={errors.collectionId?.message} />
                </View>

                <View className="gap-2">
                  <Text className="text-sm font-semibold text-textPrimary">Nome</Text>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onBlur, onChange, value } }) => (
                      <TextInput
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        placeholder="Travel"
                        placeholderTextColor={colors.textSecondary}
                        editable={!isSaving}
                        className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-textPrimary"
                      />
                    )}
                  />
                  <FieldError message={errors.name?.message} />
                </View>

                <View className="gap-2">
                  <Text className="text-sm font-semibold text-textPrimary">Descrição</Text>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onBlur, onChange, value } }) => (
                      <TextInput
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        placeholder="Opcional"
                        placeholderTextColor={colors.textSecondary}
                        editable={!isSaving}
                        multiline
                        textAlignVertical="top"
                        className="min-h-24 rounded-xl border border-border bg-surface px-4 py-3 text-base text-textPrimary"
                      />
                    )}
                  />
                  <FieldError message={errors.description?.message} />
                </View>

                <View className="flex-row items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-textPrimary">
                      Cards reversos automáticos
                    </Text>
                    <Text className="mt-1 text-sm text-textSecondary">
                      Gerar reverso ao criar cards
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
            )}

            {formError ? (
              <Text className="text-sm font-medium text-danger">{formError}</Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Salvar deck"
              accessibilityState={{ disabled: isFormDisabled }}
              disabled={isFormDisabled}
              onPress={onSubmit}
              className={`items-center rounded-xl bg-primary px-4 py-4 active:opacity-90 ${
                isFormDisabled ? 'opacity-50' : ''
              }`}
            >
              <Text className="text-base font-bold text-background">
                {isSaving ? 'Salvando...' : 'Salvar deck'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
