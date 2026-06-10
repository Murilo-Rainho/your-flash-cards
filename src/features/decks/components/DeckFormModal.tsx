import { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Icon } from '@/components/common/Icon';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { TextAreaField } from '@/components/forms/TextAreaField';
import { TextField } from '@/components/forms/TextField';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

export type DeckFormValues = {
  name: string;
  description: string;
  autoGenerateReverseCards: boolean;
};

export type DeckFormErrors = {
  name?: string;
  description?: string;
};

type DeckFormModalProps = {
  visible: boolean;
  mode: 'create' | 'edit';
  /** Coleção (fixa) à qual o deck pertence. Mostrada apenas para leitura. */
  collectionName: string;
  initialValues?: DeckFormValues;
  isSaving: boolean;
  fieldErrors?: DeckFormErrors;
  formError?: string;
  onSubmit: (values: DeckFormValues) => void;
  onClose: () => void;
};

const emptyValues: DeckFormValues = {
  name: '',
  description: '',
  autoGenerateReverseCards: false,
};

/**
 * Modal de criação/edição de deck reutilizável (coleção fixa). Centraliza o
 * formulário antes disperso na criação inline do fluxo de novo card.
 */
export function DeckFormModal({
  visible,
  mode,
  collectionName,
  initialValues,
  isSaving,
  fieldErrors,
  formError,
  onSubmit,
  onClose,
}: DeckFormModalProps) {
  const strings = useStrings();
  const { colors } = useTheme();
  const [values, setValues] = useState<DeckFormValues>(initialValues ?? emptyValues);

  useEffect(() => {
    if (visible) {
      setValues(initialValues ?? emptyValues);
    }
  }, [visible, initialValues]);

  const title = mode === 'create' ? strings.decks.newTitle : strings.decks.editTitle;
  const saveLabel = mode === 'create' ? strings.decks.saveLabel : strings.decks.saveEditLabel;
  const saveA11y = mode === 'create' ? strings.decks.saveA11y : strings.decks.saveEditA11y;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      maxContentHeight={520}
      closeAccessibilityLabel={`${strings.common.cancel} ${title}`}
    >
      <View
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
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
            {strings.decks.collectionLabel}
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
        label={strings.decks.nameLabel}
        value={values.name}
        placeholder={strings.decks.namePlaceholder}
        error={fieldErrors?.name}
        disabled={isSaving}
        onChangeText={(name) => setValues((prev) => ({ ...prev, name }))}
      />

      <TextAreaField
        label={strings.decks.descriptionLabel}
        value={values.description}
        placeholder={strings.decks.descriptionPlaceholder}
        error={fieldErrors?.description}
        disabled={isSaving}
        minHeight={96}
        onChangeText={(description) => setValues((prev) => ({ ...prev, description }))}
      />

      <View
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
        className="flex-row items-center justify-between gap-4 rounded-2xl border p-4"
      >
        <View className="flex-1">
          <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
            {strings.decks.reverseCardsLabel}
          </Text>
          <Text style={{ color: colors.textSecondary }} className="mt-1 text-sm">
            {strings.decks.reverseCardsHint}
          </Text>
        </View>
        <Switch
          value={values.autoGenerateReverseCards}
          disabled={isSaving}
          onValueChange={(autoGenerateReverseCards) =>
            setValues((prev) => ({ ...prev, autoGenerateReverseCards }))
          }
          trackColor={{ false: colors.border, true: colors.secondary }}
          thumbColor={colors.background}
        />
      </View>

      {formError ? (
        <Text style={{ color: colors.danger }} className="text-sm font-medium">
          {formError}
        </Text>
      ) : null}

      <View className="gap-2">
        <PrimaryButton
          label={isSaving ? strings.common.saving : saveLabel}
          accessibilityLabel={saveA11y}
          disabled={isSaving}
          onPress={() => onSubmit(values)}
        />
        <SecondaryButton
          label={strings.common.cancel}
          accessibilityLabel={strings.common.cancel}
          disabled={isSaving}
          onPress={onClose}
        />
      </View>
    </BottomSheet>
  );
}
