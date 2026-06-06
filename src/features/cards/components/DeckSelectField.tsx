import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { FieldError } from '@/components/common/FieldError';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import type { SelectOption } from '@/components/forms/SelectField';
import { TextAreaField } from '@/components/forms/TextAreaField';
import { TextField } from '@/components/forms/TextField';
import { useTheme } from '@/theme/useTheme';

type DeckSelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  collectionLabel: string;
  collectionName: string;
  emptyHint?: string;
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
  createDeckLabel: string;
  createDeckA11y: string;
  nameLabel: string;
  namePlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  saveDeckLabel: string;
  saveDeckA11y: string;
  backLabel: string;
  backA11y: string;
  isCreatingDeck: boolean;
  createDeckErrors?: {
    name?: string;
    description?: string;
    form?: string;
  };
  onCreateDeck: (input: { name: string; description: string }) => Promise<boolean>;
  onCreateFormDismiss?: () => void;
};

/** Seletor de deck com criação inline no modal (usado na tela de novo card). */
export function DeckSelectField({
  label,
  value,
  placeholder,
  options,
  collectionLabel,
  collectionName,
  emptyHint,
  disabled = false,
  error,
  onChange,
  createDeckLabel,
  createDeckA11y,
  nameLabel,
  namePlaceholder,
  descriptionLabel,
  descriptionPlaceholder,
  saveDeckLabel,
  saveDeckA11y,
  backLabel,
  backA11y,
  isCreatingDeck,
  createDeckErrors,
  onCreateDeck,
  onCreateFormDismiss,
}: DeckSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { colors, shadows } = useTheme();
  const selectedOption = options.find((option) => option.value === value);

  const resetCreateForm = () => {
    setMode('list');
    setName('');
    setDescription('');
    onCreateFormDismiss?.();
  };

  const closeModal = () => {
    setOpen(false);
    resetCreateForm();
  };

  const handleCreateDeck = async () => {
    const success = await onCreateDeck({ name, description });
    if (success) {
      closeModal();
    }
  };

  return (
    <View className="gap-2">
      <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={{
          borderColor: colors.border,
          backgroundColor: colors.surface,
          opacity: disabled ? 0.5 : 1,
        }}
        className="rounded-xl border px-4 py-3 active:opacity-90"
      >
        <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
          {selectedOption?.label ?? placeholder}
        </Text>
        {selectedOption?.description ? (
          <Text style={{ color: colors.textSecondary }} className="mt-1 text-sm">
            {selectedOption.description}
          </Text>
        ) : null}
      </Pressable>
      <FieldError message={error} />

      <Modal visible={open} transparent animationType="fade" onRequestClose={closeModal}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Fechar ${label}`}
          onPress={closeModal}
          style={{ backgroundColor: `${colors.textPrimary}66` }}
          className="flex-1 justify-end p-4"
        >
          <Pressable onPress={() => undefined}>
            <View
              style={{ backgroundColor: colors.background, ...shadows.lg }}
              className="rounded-xl p-2"
            >
              <Text style={{ color: colors.textPrimary }} className="px-3 py-2 text-base font-bold">
                {label}
              </Text>

              {mode === 'list' ? (
                <>
                  <ScrollView style={{ maxHeight: 360 }} keyboardShouldPersistTaps="handled">
                    {options.length === 0 && emptyHint ? (
                      <Text style={{ color: colors.textSecondary }} className="px-3 py-2 text-sm">
                        {emptyHint}
                      </Text>
                    ) : null}
                    {options.map((option) => {
                      const selected = option.value === value;

                      return (
                        <Pressable
                          key={option.value}
                          accessibilityRole="button"
                          accessibilityLabel={option.label}
                          accessibilityState={{ selected }}
                          onPress={() => {
                            onChange(option.value);
                            closeModal();
                          }}
                          style={{ backgroundColor: selected ? colors.surface : colors.background }}
                          className="rounded-xl p-3 active:opacity-90"
                        >
                          <View className="flex-row items-center gap-2">
                            <Text
                              style={{ color: colors.textPrimary }}
                              className="flex-1 text-base font-semibold"
                            >
                              {option.label}
                            </Text>
                            {option.badge ? (
                              <View
                                style={{ backgroundColor: colors.secondary }}
                                className="rounded-lg px-2 py-1"
                              >
                                <Text
                                  style={{ color: colors.background }}
                                  className="text-xs font-bold"
                                >
                                  {option.badge}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                          {option.description ? (
                            <Text style={{ color: colors.textSecondary }} className="mt-1 text-sm">
                              {option.description}
                            </Text>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  <View className="gap-2 px-2 pt-2">
                    <PrimaryButton
                      label={createDeckLabel}
                      accessibilityLabel={createDeckA11y}
                      disabled={isCreatingDeck}
                      onPress={() => setMode('create')}
                    />
                  </View>
                </>
              ) : (
                <ScrollView style={{ maxHeight: 480 }} keyboardShouldPersistTaps="handled">
                  <View className="gap-4 px-2 pb-2">
                    <View
                      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                      className="gap-1 rounded-xl border p-4"
                    >
                      <Text
                        style={{ color: colors.textSecondary }}
                        className="text-sm font-semibold"
                      >
                        {collectionLabel}
                      </Text>
                      <Text
                        style={{ color: colors.textPrimary }}
                        className="text-base font-semibold"
                      >
                        {collectionName}
                      </Text>
                    </View>

                    <TextField
                      label={nameLabel}
                      value={name}
                      placeholder={namePlaceholder}
                      error={createDeckErrors?.name}
                      disabled={isCreatingDeck}
                      onChangeText={setName}
                    />

                    <TextAreaField
                      label={descriptionLabel}
                      value={description}
                      placeholder={descriptionPlaceholder}
                      error={createDeckErrors?.description}
                      disabled={isCreatingDeck}
                      minHeight={96}
                      onChangeText={setDescription}
                    />

                    {createDeckErrors?.form ? (
                      <Text style={{ color: colors.danger }} className="text-sm font-medium">
                        {createDeckErrors.form}
                      </Text>
                    ) : null}

                    <View className="gap-2">
                      <PrimaryButton
                        label={saveDeckLabel}
                        accessibilityLabel={saveDeckA11y}
                        disabled={isCreatingDeck}
                        onPress={() => {
                          void handleCreateDeck();
                        }}
                      />
                      <SecondaryButton
                        label={backLabel}
                        accessibilityLabel={backA11y}
                        disabled={isCreatingDeck}
                        onPress={resetCreateForm}
                      />
                    </View>
                  </View>
                </ScrollView>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
