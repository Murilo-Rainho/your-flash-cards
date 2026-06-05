import type { ReactNode } from 'react';
import { Text, TextInput, View } from 'react-native';

import { FieldError } from '@/components/common/FieldError';
import { colors } from '@/theme';

const clozeInputClassName = 'min-w-[72px] flex-1 text-base text-textPrimary';

function ClozeInputShell({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-3">
      {children}
    </View>
  );
}

type ClozePartPlaceholders = {
  before: string;
  gap: string;
  after: string;
};

type ClozeSideFieldProps = {
  label: string;
  description?: string;
  before: string;
  gap: string;
  after: string;
  placeholders: ClozePartPlaceholders;
  error?: string;
  disabled?: boolean;
  onChangeBefore: (value: string) => void;
  onChangeGap: (value: string) => void;
  onChangeAfter: (value: string) => void;
};

function ClozeSideField({
  label,
  description,
  before,
  gap,
  after,
  placeholders,
  error,
  disabled = false,
  onChangeBefore,
  onChangeGap,
  onChangeAfter,
}: ClozeSideFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-textPrimary">{label}</Text>
      {description ? <Text className="text-sm text-textSecondary">{description}</Text> : null}
      <ClozeInputShell>
        <TextInput
          value={before}
          onChangeText={onChangeBefore}
          placeholder={placeholders.before}
          placeholderTextColor={colors.textSecondary}
          editable={!disabled}
          className={clozeInputClassName}
        />
        <Text className="text-base font-semibold text-textPrimary">{'{'}</Text>
        <TextInput
          value={gap}
          onChangeText={onChangeGap}
          placeholder={placeholders.gap}
          placeholderTextColor={colors.textSecondary}
          editable={!disabled}
          autoCapitalize="none"
          className={clozeInputClassName}
        />
        <Text className="text-base font-semibold text-textPrimary">{'}'}</Text>
        <TextInput
          value={after}
          onChangeText={onChangeAfter}
          placeholder={placeholders.after}
          placeholderTextColor={colors.textSecondary}
          editable={!disabled}
          autoCapitalize="none"
          className={clozeInputClassName}
        />
      </ClozeInputShell>
      <FieldError message={error} />
    </View>
  );
}

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

export function ClozeFrontField(props: ClozeFrontFieldProps) {
  return (
    <ClozeSideField
      label="Frente"
      description="Monte a frase com uma lacuna. No verso, informe a frase completa com a resposta correta."
      placeholders={{ before: "I'm ", gap: 'cansado', after: ' now' }}
      {...props}
    />
  );
}

type ClozeBackFieldProps = {
  before: string;
  gap: string;
  after: string;
  error?: string;
  disabled?: boolean;
  onChangeBefore: (value: string) => void;
  onChangeGap: (value: string) => void;
  onChangeAfter: (value: string) => void;
};

export function ClozeBackField(props: ClozeBackFieldProps) {
  return (
    <ClozeSideField
      label="Verso"
      placeholders={{ before: "I'm ", gap: 'tired', after: ' now' }}
      {...props}
    />
  );
}
