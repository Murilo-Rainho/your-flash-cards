import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { TextField } from '@/components/forms/TextField';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
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
  const { colors, shadows } = useTheme();
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${strings.common.cancel} ${title}`}
        onPress={onClose}
        style={{ backgroundColor: `${colors.textPrimary}66` }}
        className="flex-1 justify-end p-4"
      >
        <Pressable onPress={() => undefined}>
          <View
            style={{ backgroundColor: colors.background, ...shadows.lg }}
            className="rounded-xl p-2"
          >
            <Text style={{ color: colors.textPrimary }} className="px-3 py-2 text-base font-bold">
              {title}
            </Text>

            <ScrollView style={{ maxHeight: 360 }} keyboardShouldPersistTaps="handled">
              <View className="gap-4 px-2 pb-2">
                <View
                  style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                  className="gap-1 rounded-xl border p-4"
                >
                  <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold">
                    {strings.tags.collectionLabel}
                  </Text>
                  <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
                    {collectionName}
                  </Text>
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
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
