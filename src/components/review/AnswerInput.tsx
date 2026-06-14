import { Pressable, Text, TextInput, View } from 'react-native';

import type { StringCatalog } from '@/strings/types';
import { useTheme } from '@/theme/useTheme';

import type { ReviewAnswerBehavior } from './types';

type AnswerInputProps = {
  answer: ReviewAnswerBehavior;
  strings: StringCatalog['review']['answer'];
  /** Valor digitado único (typing/listening), controlado pelo FlashcardReview. */
  typed: string;
  onChangeTyped: (value: string) => void;
  /** Valores digitados por lacuna (cloze), alinhados a `answer.blanks`. */
  clozeTyped: string[];
  onChangeClozeAnswer: (index: number, value: string) => void;
  disabled?: boolean;
};

/** Afordância de resposta no estado QUESTION, conforme o tipo de card. */
export function AnswerInput({
  answer,
  strings,
  typed,
  onChangeTyped,
  clozeTyped,
  onChangeClozeAnswer,
  disabled = false,
}: AnswerInputProps) {
  const { colors } = useTheme();

  if (answer.kind === 'reveal') {
    return null;
  }

  if (answer.kind === 'cloze') {
    // Uma entrada por lacuna; com 1 lacuna fica igual ao comportamento anterior.
    return (
      <View className="gap-3">
        {answer.blanks.map((blank, index) => (
          <View key={index} className="gap-2">
            <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
              {blank.label}
            </Text>
            <TextInput
              value={clozeTyped[index] ?? ''}
              onChangeText={(value) => onChangeClozeAnswer(index, value)}
              editable={!disabled}
              placeholder={strings.placeholder}
              placeholderTextColor={colors.textSecondary}
              selectionColor={colors.primary}
              selectionHandleColor={colors.primary}
              cursorColor={colors.primary}
              underlineColorAndroid="transparent"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
                color: colors.textPrimary,
              }}
              className="rounded-xl border px-4 py-3 text-base"
            />
          </View>
        ))}
      </View>
    );
  }

  if (answer.kind === 'typing') {
    return (
      <View className="gap-2">
        <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
          {answer.promptLabel ?? strings.typingPrompt}
        </Text>
        <TextInput
          value={typed}
          onChangeText={onChangeTyped}
          editable={!disabled}
          placeholder={strings.placeholder}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.primary}
          selectionHandleColor={colors.primary}
          cursorColor={colors.primary}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          style={{
            borderColor: colors.border,
            backgroundColor: colors.surface,
            color: colors.textPrimary,
          }}
          className="rounded-xl border px-4 py-3 text-base"
        />
      </View>
    );
  }

  if (answer.kind === 'listening') {
    return (
      <View className="gap-3">
        <View className="gap-2">
          <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
            {answer.promptLabel ?? strings.listeningPrompt}
          </Text>
          <TextInput
            value={typed}
            onChangeText={onChangeTyped}
            editable={!disabled}
            placeholder={strings.placeholder}
            placeholderTextColor={colors.textSecondary}
            selectionColor={colors.primary}
            selectionHandleColor={colors.primary}
            cursorColor={colors.primary}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
            style={{
              borderColor: colors.border,
              backgroundColor: colors.surface,
              color: colors.textPrimary,
            }}
            className="rounded-xl border px-4 py-3 text-base"
          />
        </View>
        <Text style={{ color: colors.textSecondary }} className="text-center text-xs">
          {strings.orRecord}
        </Text>
        <RecordingButton
          accessibilityLabel={answer.isRecording ? strings.stopRecording : strings.recordAnswer}
          label={answer.isRecording ? strings.stopRecording : strings.recordAnswer}
          onPress={answer.isRecording ? answer.onStopRecording : answer.onStartRecording}
          busy={answer.isRecording}
          disabled={disabled}
        />
        {answer.recordedUri ? (
          <RecordingButton
            accessibilityLabel={strings.playRecording}
            label={strings.playRecording}
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
            ? strings.stopRecording
            : answer.recordedUri
              ? strings.recordAgain
              : strings.recordVoice
        }
        label={
          answer.isRecording
            ? strings.stopRecording
            : answer.recordedUri
              ? strings.recordAgain
              : strings.recordVoice
        }
        onPress={answer.isRecording ? answer.onStopRecording : answer.onStartRecording}
        busy={answer.isRecording}
        disabled={disabled}
      />
      {answer.recordedUri && !answer.isRecording ? (
        <RecordingButton
          accessibilityLabel={strings.playRecording}
          label={strings.playRecording}
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
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      onPress={onPress}
      style={{
        borderColor: busy ? colors.danger : colors.border,
        backgroundColor: colors.surface,
      }}
      className={`items-center rounded-xl border px-4 py-3 active:opacity-90 ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <Text
        style={{ color: busy ? colors.danger : colors.textPrimary }}
        className="text-base font-medium"
      >
        {label}
      </Text>
    </Pressable>
  );
}
