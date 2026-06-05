import { Pressable, Text, TextInput, View } from 'react-native';

import { colors } from '@/theme';

import type { ReviewAnswerBehavior } from './types';

type AnswerInputProps = {
  answer: ReviewAnswerBehavior;
  /** Valor digitado (controlado pelo FlashcardReview) — usado em cloze/typing. */
  typed: string;
  onChangeTyped: (value: string) => void;
  disabled?: boolean;
};

/** Afordância de resposta no estado QUESTION, conforme o tipo de card. */
export function AnswerInput({ answer, typed, onChangeTyped, disabled = false }: AnswerInputProps) {
  if (answer.kind === 'reveal') {
    return null;
  }

  if (answer.kind === 'cloze' || answer.kind === 'typing') {
    const defaultLabel =
      answer.kind === 'cloze' ? 'Preencha a lacuna (opcional)' : 'Digite sua resposta';

    return (
      <View className="gap-2">
        <Text className="text-sm font-semibold text-textPrimary">
          {answer.promptLabel ?? defaultLabel}
        </Text>
        <TextInput
          value={typed}
          onChangeText={onChangeTyped}
          editable={!disabled}
          placeholder="Sua resposta"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-textPrimary"
        />
      </View>
    );
  }

  if (answer.kind === 'listening') {
    return (
      <View className="gap-3">
        <View className="gap-2">
          <Text className="text-sm font-semibold text-textPrimary">
            {answer.promptLabel ?? 'Escreva o que você ouviu'}
          </Text>
          <TextInput
            value={typed}
            onChangeText={onChangeTyped}
            editable={!disabled}
            placeholder="Sua resposta"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-textPrimary"
          />
        </View>
        <Text className="text-center text-xs text-textSecondary">ou grave sua resposta</Text>
        <RecordingButton
          accessibilityLabel={answer.isRecording ? 'Parar gravação' : 'Gravar resposta'}
          label={answer.isRecording ? 'Parar gravação' : 'Gravar resposta'}
          onPress={answer.isRecording ? answer.onStopRecording : answer.onStartRecording}
          busy={answer.isRecording}
          disabled={disabled}
        />
        {answer.recordedUri ? (
          <RecordingButton
            accessibilityLabel="Ouvir minha gravação"
            label="Ouvir minha gravação"
            onPress={answer.onPlayRecording}
            disabled={disabled}
          />
        ) : null}
      </View>
    );
  }

  // answer.kind === 'recording' (pronúncia §12): a frente grava a própria voz (e regrava) e,
  // se já houver gravação, permite reouvi-la. O áudio modelo só aparece no verso, ao virar.
  return (
    <View className="gap-2">
      <RecordingButton
        accessibilityLabel={
          answer.isRecording
            ? 'Parar gravação'
            : answer.recordedUri
              ? 'Gravar novamente'
              : 'Gravar minha voz'
        }
        label={
          answer.isRecording
            ? 'Parar gravação'
            : answer.recordedUri
              ? 'Gravar novamente'
              : 'Gravar minha voz'
        }
        onPress={answer.isRecording ? answer.onStopRecording : answer.onStartRecording}
        busy={answer.isRecording}
        disabled={disabled}
      />
      {answer.recordedUri && !answer.isRecording ? (
        <RecordingButton
          accessibilityLabel="Ouvir minha gravação"
          label="Ouvir minha gravação"
          onPress={answer.onPlayRecording}
          disabled={disabled}
        />
      ) : null}
    </View>
  );
}

type RecordingButtonProps = {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
};

function RecordingButton({
  label,
  accessibilityLabel,
  onPress,
  busy = false,
  disabled = false,
}: RecordingButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      onPress={onPress}
      className={`items-center rounded-xl border bg-surface px-4 py-3 active:opacity-90 ${
        busy ? 'border-danger' : 'border-border'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <Text className={`text-base font-medium ${busy ? 'text-danger' : 'text-textPrimary'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
