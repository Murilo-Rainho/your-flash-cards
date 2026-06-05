import { Pressable, Text, View } from 'react-native';

import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';

type AnswerFeedbackProps = {
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
  correct,
  typed,
  expected,
  onToggleOverride,
}: AnswerFeedbackProps) {
  const { colors } = useTheme();
  const strings = useStrings();
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
        {correct ? strings.review.correct : strings.review.incorrect}
      </Text>

      {!correct && trimmedTyped ? (
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          Você escreveu:{' '}
          <Text style={{ color: colors.textPrimary }} className="font-semibold">
            {trimmedTyped}
          </Text>
        </Text>
      ) : null}

      {expected ? (
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          {strings.review.expectedAnswer}{' '}
          <Text style={{ color: colors.textPrimary }} className="font-semibold">
            {expected}
          </Text>
        </Text>
      ) : null}

      {onToggleOverride ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={correct ? 'Marcar como errei' : 'Marcar como acertei'}
          onPress={onToggleOverride}
          className="self-start active:opacity-70"
        >
          <Text style={{ color: colors.primary }} className="text-sm font-medium">
            {strings.review.actuallyWrong}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
