import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { FieldError } from '@/components/common/FieldError';
import { Icon } from '@/components/common/Icon';
import { SelectableChip } from '@/components/forms/SelectableChip';
import { LIMITS } from '@/constants/limits';
import type { Tag } from '@/domain/entities/Tag';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';
import { normalizeTagKey, normalizeTagName } from '@/utils/normalizeText';

import { isCreateTagInputError } from '../services/createTag';
import { useCreateTag } from '../hooks/useCreateTag';
import { useTags } from '../hooks/useTags';

const { MAX_TAGS, MAX_TAG_LENGTH } = LIMITS;

type TagPickerProps = {
  /** Collection à qual as tags pertencem (§6/§30.7). */
  collectionId: string;
  /** Nomes das tags selecionadas (fonte da verdade no formulário). */
  value: string[];
  onChange: (names: string[]) => void;
  disabled?: boolean;
  error?: string;
};

type PickerChip = {
  key: string;
  name: string;
  selected: boolean;
};

function createErrorMessage(error: unknown, fallback: string): string | undefined {
  if (isCreateTagInputError(error)) {
    return error.fieldErrors.name;
  }

  if (error instanceof Error) {
    return fallback;
  }

  return undefined;
}

/**
 * Seleciona tags existentes (chips) e cria novas tags inline.
 *
 * A criação persiste a tag imediatamente (offline, SQLite) e a lista é revalidada via
 * React Query, então a nova tag aparece na hora — sem reload. A comparação é feita por
 * `normalizedName` na collection para evitar duplicatas como "verbs" vs "Verb" (§6/§30.7).
 */
export function TagPicker({
  collectionId,
  value,
  onChange,
  disabled = false,
  error,
}: TagPickerProps) {
  const strings = useStrings();
  const { colors, shadows } = useTheme();
  const tagsQuery = useTags(collectionId);
  const createTagMutation = useCreateTag();
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);

  const tags = useMemo<Tag[]>(() => tagsQuery.data ?? [], [tagsQuery.data]);

  const selectedKeys = useMemo(() => new Set(value.map(normalizeTagKey)), [value]);
  const knownKeys = useMemo(() => new Set(tags.map((tag) => tag.normalizedName)), [tags]);

  const chips = useMemo<PickerChip[]>(() => {
    const fromRepository = tags.map<PickerChip>((tag) => ({
      key: tag.normalizedName,
      name: tag.name,
      selected: selectedKeys.has(tag.normalizedName),
    }));

    // Defensivo: nomes selecionados que ainda não estão na lista do banco.
    const extras = value
      .filter((name) => !knownKeys.has(normalizeTagKey(name)))
      .map<PickerChip>((name) => ({ key: normalizeTagKey(name), name, selected: true }));

    return [...fromRepository, ...extras];
  }, [tags, value, selectedKeys, knownKeys]);

  const atMaxTags = value.length >= MAX_TAGS;

  const toggle = (chip: PickerChip) => {
    if (chip.selected) {
      onChange(value.filter((name) => normalizeTagKey(name) !== chip.key));
      return;
    }

    if (atMaxTags) {
      return;
    }

    onChange([...value, chip.name]);
  };

  const draftName = normalizeTagName(draft);
  const draftKey = normalizeTagKey(draftName);
  const isDuplicate =
    draftKey.length > 0 && (knownKeys.has(draftKey) || selectedKeys.has(draftKey));
  const isTooLong = draftName.length > MAX_TAG_LENGTH;
  const canCreate =
    collectionId.length > 0 &&
    !disabled &&
    !createTagMutation.isPending &&
    !atMaxTags &&
    draftName.length > 0 &&
    !isTooLong &&
    !isDuplicate;

  const handleCreate = () => {
    if (!canCreate) {
      return;
    }

    createTagMutation.mutate(
      { collectionId, name: draftName },
      {
        onSuccess: (created) => {
          setDraft('');

          if (!normalizeTagKey(created.name) || selectedKeys.has(created.normalizedName)) {
            return;
          }

          onChange([...value, created.name]);
        },
      },
    );
  };

  const createHint = (() => {
    if (isDuplicate) {
      return strings.tags.duplicateHint;
    }

    if (isTooLong) {
      return strings.tags.tooLongHint;
    }

    if (atMaxTags) {
      return strings.tags.limitHint;
    }

    return createErrorMessage(createTagMutation.error, strings.tags.createError);
  })();

  const inputBorderColor = focused || draft.length > 0 ? colors.primary : colors.border;

  return (
    <View className="gap-3">
      <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
        {strings.tags.title}
      </Text>

      <View
        style={{ borderColor: colors.border, backgroundColor: colors.surface, ...shadows.sm }}
        className="gap-3 rounded-2xl border p-3"
      >
        {chips.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {chips.map((chip) => (
              <SelectableChip
                key={chip.key}
                label={chip.name}
                selected={chip.selected}
                disabled={disabled || (!chip.selected && atMaxTags)}
                accessibilityLabel={`${strings.tags.selectA11yPrefix} ${chip.name}`}
                onPress={() => toggle(chip)}
              />
            ))}
          </View>
        ) : (
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            {strings.tags.noTagsHint}
          </Text>
        )}

        <View className="flex-row items-center gap-2">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={strings.tags.createPlaceholder}
            placeholderTextColor={colors.textSecondary}
            editable={!disabled}
            accessibilityLabel={strings.tags.createPlaceholder}
            accessibilityState={{ disabled }}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleCreate}
            style={{
              borderColor: inputBorderColor,
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              opacity: disabled ? 0.5 : 1,
            }}
            className="min-h-12 flex-1 rounded-2xl border px-4 py-3 text-base"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.tags.createA11y}
            accessibilityState={{ disabled: !canCreate }}
            disabled={!canCreate}
            onPress={handleCreate}
            style={{
              borderColor: colors.primary,
              backgroundColor: canCreate ? colors.primary : colors.surface,
              opacity: canCreate ? 1 : 0.5,
            }}
            className="h-12 w-12 items-center justify-center rounded-2xl border active:opacity-90"
          >
            <Icon name="add" size={22} color={canCreate ? colors.background : colors.primary} />
          </Pressable>
        </View>
      </View>

      <FieldError message={error ?? createHint} />
    </View>
  );
}
