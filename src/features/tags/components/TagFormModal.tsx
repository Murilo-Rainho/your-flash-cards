import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Icon } from '@/components/common/Icon';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { TextField } from '@/components/forms/TextField';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

export type TagFormValues = {
  name: string;
};

export type TagFormErrors = {
  name?: string;
};

type TagFormModalProps = {
  visible: boolean;
  mode: 'create' | 'edit';
  collectionName: string;
  initialValues?: TagFormValues;
  isSaving: boolean;
  fieldErrors?: TagFormErrors;
  formError?: string;
  onSubmit: (values: TagFormValues) => void;
  onClose: () => void;
};

const emptyValues: TagFormValues = {
  name: '',
};

export function TagFormModal({
  visible,
  mode,
  collectionName,
  initialValues,
  isSaving,
  fieldErrors,
  formError,
  onSubmit,
  onClose,
}: TagFormModalProps) {
  const strings = useStrings();
  const { colors } = useTheme();
  const [values, setValues] = useState<TagFormValues>(initialValues ?? emptyValues);

  useEffect(() => {
    if (visible) {
      setValues(initialValues ?? emptyValues);
    }
  }, [visible, initialValues]);

  const title = mode === 'create' ? strings.tags.newTitle : strings.tags.editTitle;
  const saveLabel = mode === 'create' ? strings.tags.saveLabel : strings.tags.saveEditLabel;
  const saveA11y = mode === 'create' ? strings.tags.saveA11y : strings.tags.saveEditA11y;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      maxContentHeight={360}
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
            {strings.tags.collectionLabel}
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
        label={strings.tags.nameLabel}
        value={values.name}
        placeholder={strings.tags.createPlaceholder}
        error={fieldErrors?.name}
        disabled={isSaving}
        autoCapitalize="none"
        onChangeText={(name) => setValues((prev) => ({ ...prev, name }))}
      />

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
