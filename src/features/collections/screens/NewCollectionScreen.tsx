import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { LANGUAGES } from '@/constants/languages';
import { ROUTES } from '@/constants/routes';
import { colors } from '@/theme';
import { useCreateCollection } from '@/features/collections/hooks/useCreateCollection';
import {
  isCreateCollectionInputError,
  type CreateCollectionField,
  type CreateCollectionInput,
} from '@/features/collections/services/createCollection';

const defaultValues: CreateCollectionInput = {
  name: '',
  baseLanguage: 'pt',
  targetLanguage: 'en',
  description: '',
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <Text className="text-sm text-danger">{message}</Text>;
}

export function NewCollectionScreen() {
  const router = useRouter();
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
      await createCollectionMutation.mutateAsync(values);
      router.replace(ROUTES.HOME);
    } catch (error) {
      if (isCreateCollectionInputError(error)) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          if (message) {
            setError(field as CreateCollectionField, { message });
          }
        });
        return;
      }

      setFormError('Não foi possível criar a coleção local.');
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
                Nova Coleção
              </Text>
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
                    placeholder="Português para Inglês"
                    placeholderTextColor={colors.textSecondary}
                    editable={!isSaving}
                    className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-textPrimary"
                  />
                )}
              />
              <FieldError message={errors.name?.message} />
            </View>

            <View className="gap-3">
              <Text className="text-sm font-semibold text-textPrimary">Idioma base</Text>
              <View className="flex-row flex-wrap gap-2">
                {LANGUAGES.map((language) => {
                  const selected = language.code === baseLanguage;

                  return (
                    <Pressable
                      key={language.code}
                      accessibilityRole="button"
                      accessibilityLabel={`Idioma base ${language.label}`}
                      accessibilityState={{ selected }}
                      disabled={isSaving}
                      onPress={() =>
                        setValue('baseLanguage', language.code, {
                          shouldDirty: true,
                          shouldValidate: false,
                        })
                      }
                      className={`rounded-xl border px-3 py-2 ${
                        selected ? 'border-primary bg-surface' : 'border-border bg-background'
                      }`}
                    >
                      <Text className="text-sm font-medium text-textPrimary">{language.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <FieldError message={errors.baseLanguage?.message} />
            </View>

            <View className="gap-3">
              <Text className="text-sm font-semibold text-textPrimary">Idioma alvo</Text>
              <View className="flex-row flex-wrap gap-2">
                {LANGUAGES.map((language) => {
                  const selected = language.code === targetLanguage;

                  return (
                    <Pressable
                      key={language.code}
                      accessibilityRole="button"
                      accessibilityLabel={`Idioma alvo ${language.label}`}
                      accessibilityState={{ selected }}
                      disabled={isSaving}
                      onPress={() =>
                        setValue('targetLanguage', language.code, {
                          shouldDirty: true,
                          shouldValidate: false,
                        })
                      }
                      className={`rounded-xl border px-3 py-2 ${
                        selected ? 'border-primary bg-surface' : 'border-border bg-background'
                      }`}
                    >
                      <Text className="text-sm font-medium text-textPrimary">{language.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <FieldError message={errors.targetLanguage?.message} />
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

            {formError ? (
              <Text className="text-sm font-medium text-danger">{formError}</Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Salvar coleção"
              accessibilityState={{ disabled: isSaving }}
              disabled={isSaving}
              onPress={onSubmit}
              className={`items-center rounded-xl bg-primary px-4 py-4 active:opacity-90 ${
                isSaving ? 'opacity-50' : ''
              }`}
            >
              <Text className="text-base font-bold text-background">
                {isSaving ? 'Salvando...' : 'Salvar coleção'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
