import { Pressable, Text, View } from 'react-native';

import { TextAreaField } from '@/components/forms/TextAreaField';
import { TextField } from '@/components/forms/TextField';

type OptionalCardFieldsProps = {
  expanded: boolean;
  tags: string;
  notes: string;
  disabled: boolean;
  tagsError?: string;
  notesError?: string;
  onToggle: () => void;
  onChangeTags: (value: string) => void;
  onChangeNotes: (value: string) => void;
};

/** Bloco recolhível de campos opcionais do card (tags e observações). */
export function OptionalCardFields({
  expanded,
  tags,
  notes,
  disabled,
  tagsError,
  notesError,
  onToggle,
  onChangeTags,
  onChangeNotes,
}: OptionalCardFieldsProps) {
  return (
    <View className="gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Campos opcionais"
        accessibilityState={{ expanded }}
        disabled={disabled}
        onPress={onToggle}
        className="rounded-xl border border-border bg-surface px-4 py-3 active:bg-background"
      >
        <Text className="text-base font-semibold text-textPrimary">
          {expanded ? 'Ocultar opcionais' : 'Tags e observacoes'}
        </Text>
      </Pressable>

      {expanded ? (
        <>
          <TextField
            label="Tags"
            value={tags}
            placeholder="travel, listening"
            error={tagsError}
            disabled={disabled}
            onChangeText={onChangeTags}
          />

          <TextAreaField
            label="Observacoes"
            value={notes}
            placeholder="Opcional"
            error={notesError}
            disabled={disabled}
            minHeight={96}
            onChangeText={onChangeNotes}
          />
        </>
      ) : null}
    </View>
  );
}
