import { Pressable, Text, View } from 'react-native';

import type { StringCatalog } from '@/strings/types';
import { useTheme } from '@/theme/useTheme';

type AnswerFeedbackProps = {
  strings: StringCatalog['review'];
  /** Resultado efetivo (já considerando override manual, quando houver). */
  correct: boolean;
  /** Resposta que o usuário digitou (pode ser vazia). */
  typed: string;
  /** Resposta esperada (pode ser vazia em preview incompleto). */
  expected: string;
  /** Override manual (§11) — presente apenas para Escrita. */
  onToggleOverride?: () => void;
};

/** Feedback de resposta digitada no estado ANSWER (cloze/typing). */
export function AnswerFeedback({
  strings,
  correct,
  typed,
  expected,
  onToggleOverride,
}: AnswerFeedbackProps) {
  const { colors } = useTheme();
  const trimmedTyped = typed.trim();

  return (
    <View
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      className="gap-2 rounded-xl border p-4"
    >
      <Text
        style={{ color: correct ? colors.success : colors.danger }}
        className="text-base font-bold"
      >
        {correct ? strings.correct : strings.incorrect}
      </Text>

      {!correct && trimmedTyped ? (
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          {strings.answer.typedAnswer}{' '}
          <Text style={{ color: colors.textPrimary }} className="font-semibold">
            {trimmedTyped}
          </Text>
        </Text>
      ) : null}

      {expected ? (
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          {strings.expectedAnswer}{' '}
          <Text style={{ color: colors.textPrimary }} className="font-semibold">
            {expected}
          </Text>
        </Text>
      ) : null}

      {onToggleOverride ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={correct ? strings.answer.markWrong : strings.answer.markCorrect}
          onPress={onToggleOverride}
          className="self-start active:opacity-70"
        >
          <Text style={{ color: colors.primary }} className="text-sm font-medium">
            {correct ? strings.actuallyWrong : strings.actuallyCorrect}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
