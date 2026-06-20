import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/common/Badge';
import { BottomSheet } from '@/components/common/BottomSheet';
import { FieldError } from '@/components/common/FieldError';
import { Icon } from '@/components/common/Icon';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SearchableListContainer } from '@/components/common/SearchableListContainer';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import type { SelectOption } from '@/components/forms/SelectField';
import { TextAreaField } from '@/components/forms/TextAreaField';
import { TextField } from '@/components/forms/TextField';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

import { filterDeckOptions } from '../services/filterDeckOptions';

type DeckSelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  collectionKey?: string;
  emptyHint?: string;
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
  searchPlaceholder: string;
  searchA11y: string;
  clearSearchA11y: string;
  noResults: string;
  /** When provided, a "Create deck" button is shown inside the modal. */
  onCreateDeck?: (input: { name: string; description: string }) => Promise<boolean>;
  createDeckLabel?: string;
  createDeckA11y?: string;
  collectionLabel?: string;
  collectionName?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
  saveDeckLabel?: string;
  saveDeckA11y?: string;
  backLabel?: string;
  backA11y?: string;
  isCreatingDeck?: boolean;
  createDeckErrors?: {
    name?: string;
    description?: string;
    form?: string;
  };
  onCreateFormDismiss?: () => void;
};

/** Seletor de deck com busca e, opcionalmente, criação inline no modal. */
export function DeckSelectField({
  label,
  value,
  placeholder,
  options,
  collectionKey = '',
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
  searchPlaceholder,
  searchA11y,
  clearSearchA11y,
  noResults,
  isCreatingDeck = false,
  createDeckErrors,
  onCreateDeck,
  onCreateFormDismiss,
}: DeckSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { colors, shadows } = useTheme();
  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = useMemo(
    () => filterDeckOptions(options, searchQuery, value),
    [options, searchQuery, value],
  );
  const hasValue = Boolean(selectedOption);
  const borderColor = error ? colors.danger : focused || hasValue ? colors.primary : colors.border;
  const valueColor = hasValue ? colors.textPrimary : colors.textSecondary;

  useEffect(() => {
    setSearchQuery('');
  }, [collectionKey]);

  const resetCreateForm = () => {
    setMode('list');
    setName('');
    setDescription('');
    onCreateFormDismiss?.();
  };

  const closeModal = () => {
    setOpen(false);
    setSearchQuery('');
    resetCreateForm();
  };

  const handleCreateDeck = async () => {
    if (!onCreateDeck) return;
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
        contentScrollable={mode === 'create'}
      >
        {mode === 'list' ? (
          <View className="gap-2">
            <SearchableListContainer
              data={filteredOptions}
              query={searchQuery}
              placeholder={searchPlaceholder}
              searchAccessibilityLabel={searchA11y}
              clearSearchAccessibilityLabel={clearSearchA11y}
              emptyMessage={options.length === 0 && emptyHint ? emptyHint : noResults}
              maxResultsHeight={240}
              keyExtractor={(option) => option.value}
              onQueryChange={setSearchQuery}
              renderItem={({ item: option }) => {
                const selected = option.value === value;

                return (
                  <Pressable
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
              }}
            />

            {onCreateDeck && createDeckLabel && createDeckA11y ? (
              <View className="pt-2">
                <PrimaryButton
                  label={createDeckLabel}
                  accessibilityLabel={createDeckA11y}
                  disabled={isCreatingDeck}
                  onPress={() => setMode('create')}
                />
              </View>
            ) : null}
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
              label={nameLabel ?? ''}
              value={name}
              placeholder={namePlaceholder ?? ''}
              error={createDeckErrors?.name}
              disabled={isCreatingDeck}
              onChangeText={setName}
            />

            <TextAreaField
              label={descriptionLabel ?? ''}
              value={description}
              placeholder={descriptionPlaceholder ?? ''}
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
                label={saveDeckLabel ?? ''}
                accessibilityLabel={saveDeckA11y ?? ''}
                disabled={isCreatingDeck}
                onPress={() => {
                  void handleCreateDeck();
                }}
              />
              <SecondaryButton
                label={backLabel ?? ''}
                accessibilityLabel={backA11y ?? ''}
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
