import { Pressable, Text, View } from 'react-native';

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
  const trimmedTyped = typed.trim();

  return (
    <View className="gap-2 rounded-xl border border-border bg-surface p-4">
      <Text className={`text-base font-bold ${correct ? 'text-success' : 'text-danger'}`}>
        {correct ? 'Você acertou' : 'Não foi dessa vez'}
      </Text>

      {!correct && trimmedTyped ? (
        <Text className="text-sm text-textSecondary">
          Você escreveu: <Text className="font-semibold text-textPrimary">{trimmedTyped}</Text>
        </Text>
      ) : null}

      {expected ? (
        <Text className="text-sm text-textSecondary">
          Resposta esperada: <Text className="font-semibold text-textPrimary">{expected}</Text>
        </Text>
      ) : null}

      {onToggleOverride ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={correct ? 'Marcar como errei' : 'Marcar como acertei'}
          onPress={onToggleOverride}
          className="self-start active:opacity-70"
        >
          <Text className="text-sm font-medium text-primary">
            {correct ? 'Na verdade, errei' : 'Na verdade, acertei'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
