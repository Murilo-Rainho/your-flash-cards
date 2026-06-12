import { Text, View } from 'react-native';

import type { StringCatalog } from '@/strings/types';
import { useTheme } from '@/theme/useTheme';

import type { CheckedAnswer } from './types';

export type ClozeBlankResult = {
  label: string;
  typed: string;
  checked: CheckedAnswer;
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
              <Text style={{ color: colors.textSecondary }} className="text-sm">
                {strings.expectedAnswer}{' '}
                <Text style={{ color: colors.textPrimary }} className="font-semibold">
                  {blank.checked.expected}
                </Text>
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
