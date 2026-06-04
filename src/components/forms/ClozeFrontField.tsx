import { Text, TextInput, View } from 'react-native';

import { FieldError } from '@/components/common/FieldError';
import { colors } from '@/theme';

type ClozeFrontFieldProps = {
  before: string;
  gap: string;
  after: string;
  error?: string;
  disabled?: boolean;
  onChangeBefore: (value: string) => void;
  onChangeGap: (value: string) => void;
  onChangeAfter: (value: string) => void;
};

export function ClozeFrontField({
  before,
  gap,
  after,
  error,
  disabled = false,
  onChangeBefore,
  onChangeGap,
  onChangeAfter,
}: ClozeFrontFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-textPrimary">Frente</Text>
      <Text className="text-sm text-textSecondary">
        Monte a frase com uma lacuna. No verso, informe a frase completa com a resposta correta.
      </Text>
      <View className="flex-row flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-3">
        <TextInput
          value={before}
          onChangeText={onChangeBefore}
          placeholder="I'm "
          placeholderTextColor={colors.textSecondary}
          editable={!disabled}
          className="min-w-[72px] flex-1 text-base text-textPrimary"
        />
        <Text className="text-base font-semibold text-textPrimary">{'{'}</Text>
        <TextInput
          value={gap}
          onChangeText={onChangeGap}
          placeholder="cansado"
          placeholderTextColor={colors.textSecondary}
          editable={!disabled}
          className="min-w-[72px] flex-1 text-base text-textPrimary"
        />
        <Text className="text-base font-semibold text-textPrimary">{'}'}</Text>
        <TextInput
          value={after}
          onChangeText={onChangeAfter}
          placeholder=" now"
          placeholderTextColor={colors.textSecondary}
          editable={!disabled}
          className="min-w-[72px] flex-1 text-base text-textPrimary"
        />
      </View>
      <FieldError message={error} />
    </View>
  );
}
