import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { PrimaryButton } from '@/components/common/PrimaryButton';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { StateCard } from '@/components/common/StateCard';
import { REVIEW_RATING_ORDER } from '@/constants/reviewRatings';
import { ROUTES } from '@/constants/routes';
import { parseReviewResult } from '@/features/review/services/reviewResultParams';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';

function StatRow({ label, value }: { label: string; value: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{ borderColor: colors.border }}
      className="flex-row items-center justify-between border-b py-3"
    >
      <Text style={{ color: colors.textSecondary }} className="text-base">
        {label}
      </Text>
      <Text style={{ color: colors.textPrimary }} className="text-base font-bold">
        {value}
      </Text>
    </View>
  );
}

/**
 * Resultado da sessão (§33 #12). Recebe o resumo por params de rota (offline, sem store) e
 * oferece a volta à Home. Sem dados (deep-link direto) mostra um estado vazio.
 */
export function ReviewResultScreen() {
  const router = useRouter();
  const strings = useStrings();
  const { colors } = useTheme();
  const summary = parseReviewResult(useLocalSearchParams());

  const goHome = () => router.replace(ROUTES.HOME as Href);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 gap-6 px-4 pt-2">
        <ScreenHeader title={strings.review.result.title} onBack={goHome} />

        {!summary.hasData ? (
          <StateCard
            title={strings.review.result.emptyTitle}
            action={{
              label: strings.review.result.backHome,
              accessibilityLabel: strings.review.result.backHomeA11y,
              onPress: goHome,
              variant: 'secondary',
            }}
          />
        ) : (
          <>
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              {strings.review.result.subtitle}
            </Text>

            <View
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              className="gap-1 rounded-2xl border p-4"
            >
              <StatRow label={strings.review.result.reviewedLabel} value={summary.reviewed} />
              <StatRow label={strings.review.result.correctLabel} value={summary.correct} />
              <StatRow label={strings.review.result.wrongLabel} value={summary.wrong} />
              {REVIEW_RATING_ORDER.map((rating) => (
                <StatRow
                  key={rating}
                  label={strings.review.ratings[rating]}
                  value={summary.byRating[rating]}
                />
              ))}
            </View>

            <PrimaryButton
              label={strings.review.result.backHome}
              accessibilityLabel={strings.review.result.backHomeA11y}
              onPress={goHome}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
