import { Text, View } from 'react-native';

import type { StringCatalog } from '@/strings/types';
import { useTheme } from '@/theme/useTheme';

type AnswerFeedbackProps = {
  strings: StringCatalog['review'];
  /** Resultado calculado localmente para a resposta digitada. */
  correct: boolean;
  /** Resposta que o usuário digitou (pode ser vazia). */
  typed: string;
  /** Resposta esperada (pode ser vazia em preview incompleto). */
  expected: string;
};

/** Feedback de resposta digitada no estado ANSWER (cloze/typing). */
export function AnswerFeedback({ strings, correct, typed, expected }: AnswerFeedbackProps) {
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
    </View>
  );
}
