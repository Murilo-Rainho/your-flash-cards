import { View } from 'react-native';

import { TextAreaField } from '@/components/forms/TextAreaField';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { TagPicker } from '@/features/tags/components/TagPicker';

type OptionalCardFieldsProps = {
  collectionId: string;
  tags: string[];
  notes: string;
  disabled: boolean;
  tagsError?: string;
  notesError?: string;
  onChangeTags: (names: string[]) => void;
  onChangeNotes: (value: string) => void;
};

/** Optional card fields: multiselect tags and notes at the end. */
export function OptionalCardFields({
  collectionId,
  tags,
  notes,
  disabled,
  tagsError,
  notesError,
  onChangeTags,
  onChangeNotes,
}: OptionalCardFieldsProps) {
  const strings = useStrings();

  return (
    <View className="gap-3">
      <TagPicker
        collectionId={collectionId}
        value={tags}
        error={tagsError}
        disabled={disabled}
        onChange={onChangeTags}
      />

      <TextAreaField
        label={strings.cards.optionalFields.notesLabel}
        value={notes}
        placeholder={strings.cards.optionalFields.notesPlaceholder}
        error={notesError}
        disabled={disabled}
        minHeight={96}
        onChangeText={onChangeNotes}
      />
    </View>
  );
}
