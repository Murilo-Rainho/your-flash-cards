import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import type { StringCatalog } from '@/strings/types';
import { useTheme } from '@/theme/useTheme';

import type { CheckedAnswer } from './types';

export type ClozeBlankResult = {
  label: string;
  typed: string;
  checked: CheckedAnswer;
  selectedAnswerIndex: number;
  onSelectAnswerIndex: (index: number) => void;
};

type ClozeAnswerFeedbackProps = {
  strings: StringCatalog['review'];
  /** Resultado por lacuna respondida (lacunas não preenchidas não entram aqui). */
  blanks: ClozeBlankResult[];
};

/** Feedback por lacuna do cloze no estado ANSWER: status + o que foi digitado + esperado. */
export function ClozeAnswerFeedback({ strings, blanks }: ClozeAnswerFeedbackProps) {
  const { colors } = useTheme();

  if (blanks.length === 0) {
    return null;
  }

  return (
    <View
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      className="gap-3 rounded-xl border p-4"
    >
      {blanks.map((blank, index) => {
        const trimmedTyped = blank.typed.trim();

        return (
          <View key={index} className="gap-1">
            <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold">
              {blank.label}
            </Text>
            <Text
              style={{ color: blank.checked.correct ? colors.success : colors.danger }}
              className="text-base font-bold"
            >
              {blank.checked.correct ? strings.correct : strings.incorrect}
            </Text>
            {!blank.checked.correct && trimmedTyped ? (
              <Text style={{ color: colors.textSecondary }} className="text-sm">
                {strings.answer.typedAnswer}{' '}
                <Text style={{ color: colors.textPrimary }} className="font-semibold">
                  {trimmedTyped}
                </Text>
              </Text>
            ) : null}
            {blank.checked.expected ? (
              <View className="gap-2">
                <Text style={{ color: colors.textSecondary }} className="text-sm">
                  {strings.expectedAnswer}
                </Text>
                <AcceptedAnswerPager
                  strings={strings.answer}
                  answers={blank.checked.acceptedAnswers ?? [blank.checked.expected]}
                  selectedIndex={blank.selectedAnswerIndex}
                  onSelectIndex={blank.onSelectAnswerIndex}
                />
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

type AcceptedAnswerPagerProps = {
  strings: StringCatalog['review']['answer'];
  answers: readonly string[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
};

function AcceptedAnswerPager({
  strings,
  answers,
  selectedIndex,
  onSelectIndex,
}: AcceptedAnswerPagerProps) {
  const { colors } = useTheme();
  const safeAnswers = answers.filter((answer) => answer.trim().length > 0);
  const answerCount = safeAnswers.length;

  if (answerCount === 0) {
    return null;
  }

  const safeSelectedIndex = selectedIndex >= 0 && selectedIndex < answerCount ? selectedIndex : 0;
  const selectedAnswer = safeAnswers[safeSelectedIndex] ?? safeAnswers[0];
  const canNavigate = answerCount > 1;
  const goToPrevious = () => onSelectIndex((safeSelectedIndex - 1 + answerCount) % answerCount);
  const goToNext = () => onSelectIndex((safeSelectedIndex + 1) % answerCount);

  return (
    <View className="flex-row items-center gap-2">
      {canNavigate ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.previousAcceptedAnswerA11y}
          onPress={goToPrevious}
          style={{ borderColor: colors.border, backgroundColor: colors.background }}
          className="h-8 w-8 items-center justify-center rounded-full border active:opacity-90"
        >
          <Icon name="previous" size={16} tone="textPrimary" />
        </Pressable>
      ) : null}
      <Text
        style={{ color: colors.textPrimary }}
        className="min-h-8 flex-1 text-center text-base font-semibold"
      >
        {selectedAnswer}
      </Text>
      {canNavigate ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.nextAcceptedAnswerA11y}
          onPress={goToNext}
          style={{ borderColor: colors.border, backgroundColor: colors.background }}
          className="h-8 w-8 items-center justify-center rounded-full border active:opacity-90"
        >
          <Icon name="next" size={16} tone="textPrimary" />
        </Pressable>
      ) : null}
    </View>
  );
}
