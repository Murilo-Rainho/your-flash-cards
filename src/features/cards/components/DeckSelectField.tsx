import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/common/Badge';
import { BottomSheet } from '@/components/common/BottomSheet';
import { FieldError } from '@/components/common/FieldError';
import { Icon } from '@/components/common/Icon';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import type { SelectOption } from '@/components/forms/SelectField';
import { TextAreaField } from '@/components/forms/TextAreaField';
import { TextField } from '@/components/forms/TextField';
import { withAlpha } from '@/theme/createShadows';
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
  const [focused, setFocused] = useState(false);
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { colors, shadows } = useTheme();
  const selectedOption = options.find((option) => option.value === value);
  const hasValue = Boolean(selectedOption);
  const borderColor = error ? colors.danger : focused || hasValue ? colors.primary : colors.border;
  const valueColor = hasValue ? colors.textPrimary : colors.textSecondary;

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
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          borderColor,
          backgroundColor: colors.surface,
          opacity: disabled ? 0.5 : 1,
          ...shadows.sm,
        }}
        className="flex-row items-center gap-3 rounded-2xl border px-4 py-3 active:opacity-90"
      >
        <View className="min-w-0 flex-1">
          <Text style={{ color: valueColor }} className="text-base font-semibold" numberOfLines={1}>
            {selectedOption?.label ?? placeholder}
          </Text>
          {selectedOption?.description ? (
            <Text style={{ color: colors.textSecondary }} className="mt-1 text-sm">
              {selectedOption.description}
            </Text>
          ) : null}
        </View>
        <Icon name="chevron" size={22} tone={disabled ? 'textSecondary' : 'primary'} />
      </Pressable>
      <FieldError message={error} />

      <BottomSheet
        visible={open}
        onClose={closeModal}
        closeAccessibilityLabel={label}
        title={label}
        maxContentHeight={mode === 'create' ? 520 : 420}
      >
        {mode === 'list' ? (
          <View className="gap-2">
            {options.length === 0 && emptyHint ? (
              <Text style={{ color: colors.textSecondary }} className="px-1 py-2 text-sm">
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
                  style={{
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: colors.surface,
                    ...shadows.sm,
                  }}
                  className="rounded-2xl border p-3 active:opacity-90"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="min-w-0 flex-1">
                      <Text
                        style={{ color: colors.textPrimary }}
                        className="text-base font-semibold"
                        numberOfLines={1}
                      >
                        {option.label}
                      </Text>
                      {option.description ? (
                        <Text style={{ color: colors.textSecondary }} className="mt-1 text-sm">
                          {option.description}
                        </Text>
                      ) : null}
                    </View>
                    {option.badge ? <Badge label={option.badge} tone="secondary" /> : null}
                    {selected ? <Icon name="done" size={20} tone="primary" /> : null}
                  </View>
                </Pressable>
              );
            })}

            <View className="pt-2">
              <PrimaryButton
                label={createDeckLabel}
                accessibilityLabel={createDeckA11y}
                disabled={isCreatingDeck}
                onPress={() => setMode('create')}
              />
            </View>
          </View>
        ) : (
          <View className="gap-4">
            <View
              style={{ borderColor: colors.border, backgroundColor: colors.surface, ...shadows.sm }}
              className="flex-row items-center gap-3 rounded-2xl border p-4"
            >
              <View
                style={{ backgroundColor: withAlpha(colors.primary, 0.16) }}
                className="h-11 w-11 items-center justify-center rounded-2xl"
              >
                <Icon name="collection" size={22} tone="primary" />
              </View>
              <View className="min-w-0 flex-1">
                <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold">
                  {collectionLabel}
                </Text>
                <Text
                  style={{ color: colors.textPrimary }}
                  className="text-base font-semibold"
                  numberOfLines={1}
                >
                  {collectionName}
                </Text>
              </View>
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
        )}
      </BottomSheet>
    </View>
  );
}
