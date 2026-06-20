import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/components/common/Header';
import { Icon } from '@/components/common/Icon';
import { MetricCard } from '@/components/common/MetricCard';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SectionTitle } from '@/components/common/SectionTitle';
import { StateCard } from '@/components/common/StateCard';
import { REVIEW_RATINGS, REVIEW_RATING_ORDER, type ReviewRating } from '@/constants/reviewRatings';
import { ROUTES } from '@/constants/routes';
import { parseReviewResult } from '@/features/review/services/reviewResultParams';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import type { ColorToken } from '@/theme/colors';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

const RATING_TONES = {
  [REVIEW_RATINGS.AGAIN]: 'danger',
  [REVIEW_RATINGS.HARD]: 'warning',
  [REVIEW_RATINGS.GOOD]: 'primary',
  [REVIEW_RATINGS.EASY]: 'success',
} as const satisfies Record<ReviewRating, ColorToken>;

type ResultHeroProps = {
  title: string;
  subtitle: string;
  reviewedLabel: string;
  reviewed: number;
};

function ResultHero({ title, subtitle, reviewedLabel, reviewed }: ResultHeroProps) {
  const { colors, shadows } = useTheme();

  return (
    <View
      style={{ backgroundColor: colors.primary, ...shadows.lg }}
      className="gap-5 rounded-2xl p-6"
    >
      <View className="flex-row items-start gap-4">
        <View
          style={{ backgroundColor: colors.surface }}
          className="h-14 w-14 items-center justify-center rounded-2xl"
        >
          <Icon name="done" size={28} tone="primary" />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text style={{ color: colors.background }} className="text-3xl font-bold">
            {title}
          </Text>
          <Text style={{ color: colors.background }} className="text-sm font-medium opacity-90">
            {subtitle}
          </Text>
        </View>
      </View>

      <View
        style={{ backgroundColor: withAlpha(colors.background, 0.16) }}
        className="rounded-2xl p-4"
      >
        <Text style={{ color: colors.background }} className="text-4xl font-bold">
          {reviewed}
        </Text>
        <Text style={{ color: colors.background }} className="mt-1 text-sm font-medium opacity-90">
          {reviewedLabel}
        </Text>
      </View>
    </View>
  );
}

type RatingBreakdownCardProps = {
  labels: Record<ReviewRating, string>;
  values: Record<ReviewRating, number>;
};

function RatingBreakdownCard({ labels, values }: RatingBreakdownCardProps) {
  const { colors, shadows } = useTheme();

  return (
    <View
      style={{
        borderColor: colors.border,
        backgroundColor: colors.surface,
        ...shadows.sm,
      }}
      className="gap-2 rounded-2xl border p-3"
    >
      {REVIEW_RATING_ORDER.map((rating) => {
        const tone = RATING_TONES[rating];
        const accent = colors[tone];

        return (
          <View
            key={rating}
            style={{ backgroundColor: withAlpha(accent, 0.1) }}
            className="flex-row items-center gap-3 rounded-xl px-3 py-3"
          >
            <View style={{ backgroundColor: accent }} className="h-2.5 w-2.5 rounded-full" />
            <Text
              style={{ color: colors.textPrimary }}
              className="min-w-0 flex-1 text-base font-semibold"
              numberOfLines={1}
            >
              {labels[rating]}
            </Text>
            <Text style={{ color: accent }} className="text-lg font-bold">
              {values[rating]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/**
 * Session result (§33 #12). Receives summary via route params (offline, no store) and
 * offers return to Home. Without data (direct deep link) shows empty state.
 */
export function ReviewResultScreen() {
  const router = useRouter();
  const strings = useStrings();
  const { colors } = useTheme();
  const summary = parseReviewResult(useLocalSearchParams());

  const goHome = () => router.replace(ROUTES.HOME as Href);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-6 px-4 pb-10 pt-2">
          <Header variant="page" title={strings.common.appName} onBack={goHome} />

          {!summary.hasData ? (
            <View className="gap-3">
              <StateCard title={strings.review.result.emptyTitle} />
              <PrimaryButton
                label={strings.review.result.backHome}
                accessibilityLabel={strings.review.result.backHomeA11y}
                icon="home"
                onPress={goHome}
              />
            </View>
          ) : (
            <>
              <ResultHero
                title={strings.review.result.title}
                subtitle={strings.review.result.subtitle}
                reviewedLabel={strings.review.result.reviewedLabel}
                reviewed={summary.reviewed}
              />

              <View className="flex-row gap-3">
                <MetricCard
                  label={strings.review.result.correctLabel}
                  value={String(summary.correct)}
                  icon="done"
                  accentTone="success"
                />
                <MetricCard
                  label={strings.review.result.wrongLabel}
                  value={String(summary.wrong)}
                  icon="close"
                  accentTone="danger"
                />
              </View>

              <View className="gap-3">
                <SectionTitle title={strings.review.howDidYouDo} />
                <RatingBreakdownCard labels={strings.review.ratings} values={summary.byRating} />
              </View>

              <PrimaryButton
                label={strings.review.result.backHome}
                accessibilityLabel={strings.review.result.backHomeA11y}
                icon="home"
                onPress={goHome}
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
