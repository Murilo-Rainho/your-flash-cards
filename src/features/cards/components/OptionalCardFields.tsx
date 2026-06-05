import { Pressable, Text, View } from 'react-native';

import { TextAreaField } from '@/components/forms/TextAreaField';
import { TagPicker } from '@/features/tags/components/TagPicker';
import { useTheme } from '@/theme/useTheme';

type OptionalCardFieldsProps = {
  expanded: boolean;
  tags: string[];
  notes: string;
  disabled: boolean;
  tagsError?: string;
  notesError?: string;
  onToggle: () => void;
  onChangeTags: (names: string[]) => void;
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
  const { colors } = useTheme();

  return (
    <View className="gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Campos opcionais"
        accessibilityState={{ expanded }}
        disabled={disabled}
        onPress={onToggle}
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
        className="rounded-xl border px-4 py-3 active:opacity-90"
      >
        <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
          {expanded ? 'Ocultar opcionais' : 'Tags e observacoes'}
        </Text>
      </Pressable>

      {expanded ? (
        <>
          <TagPicker value={tags} error={tagsError} disabled={disabled} onChange={onChangeTags} />

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
