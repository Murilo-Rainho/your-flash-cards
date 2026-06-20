import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { TextAreaField } from '@/components/forms/TextAreaField';
import { TextField } from '@/components/forms/TextField';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';

export type CollectionEditValues = {
  name: string;
  description: string;
};

export type CollectionEditErrors = {
  name?: string;
  description?: string;
};

type CollectionEditModalProps = {
  visible: boolean;
  /** Language pair (immutable) shown read-only. */
  languagePair: string;
  initialValues: CollectionEditValues;
  isSaving: boolean;
  fieldErrors?: CollectionEditErrors;
  formError?: string;
  onSubmit: (values: CollectionEditValues) => void;
  onClose: () => void;
};

/** Collection edit modal: name and description only (languages are immutable). */
export function CollectionEditModal({
  visible,
  languagePair,
  initialValues,
  isSaving,
  fieldErrors,
  formError,
  onSubmit,
  onClose,
}: CollectionEditModalProps) {
  const strings = useStrings();
  const { colors, shadows } = useTheme();
  const [values, setValues] = useState<CollectionEditValues>(initialValues);

  useEffect(() => {
    if (visible) {
      setValues(initialValues);
    }
  }, [visible, initialValues]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${strings.common.cancel} ${strings.collections.editTitle}`}
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
              {strings.collections.editTitle}
            </Text>

            <ScrollView style={{ maxHeight: 480 }} keyboardShouldPersistTaps="handled">
              <View className="gap-4 px-2 pb-2">
                <View
                  style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                  className="gap-1 rounded-xl border p-4"
                >
                  <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold">
                    {`${strings.collections.baseLanguageLabel} / ${strings.collections.targetLanguageLabel}`}
                  </Text>
                  <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
                    {languagePair}
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className="mt-1 text-xs">
                    {strings.collections.languagesLockedHint}
                  </Text>
                </View>

                <TextField
                  label={strings.collections.nameLabel}
                  value={values.name}
                  placeholder={strings.collections.namePlaceholder}
                  error={fieldErrors?.name}
                  disabled={isSaving}
                  onChangeText={(name) => setValues((prev) => ({ ...prev, name }))}
                />

                <TextAreaField
                  label={strings.collections.descriptionLabel}
                  value={values.description}
                  placeholder={strings.collections.descriptionPlaceholder}
                  error={fieldErrors?.description}
                  disabled={isSaving}
                  minHeight={96}
                  onChangeText={(description) => setValues((prev) => ({ ...prev, description }))}
                />

                {formError ? (
                  <Text style={{ color: colors.danger }} className="text-sm font-medium">
                    {formError}
                  </Text>
                ) : null}

                <View className="gap-2">
                  <PrimaryButton
                    label={isSaving ? strings.common.saving : strings.collections.saveEditLabel}
                    accessibilityLabel={strings.collections.saveEditA11y}
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
