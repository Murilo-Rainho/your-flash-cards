import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Header } from '@/components/common/Header';
import { StateCard } from '@/components/common/StateCard';
import { REVIEW_RATINGS, type ReviewRating } from '@/constants/reviewRatings';
import type { DailyReviewedCard } from '@/domain/repositories/ReviewRepository';
import { useTodayReviews } from '@/features/review/hooks/useTodayReviews';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';

function ReviewedCardRow({ item }: { item: DailyReviewedCard }) {
  const { colors } = useTheme();
  const strings = useStrings();

  const ratingColors: Record<ReviewRating, { background: string; text: string }> = {
    again: { background: colors.danger, text: colors.background },
    hard: { background: colors.warning, text: colors.textPrimary },
    good: { background: colors.secondary, text: colors.background },
    easy: { background: colors.success, text: colors.background },
  };

  const palette = ratingColors[item.finalRating];
  const gotIt = item.finalRating !== REVIEW_RATINGS.AGAIN;
  const attemptsLabel =
    item.attempts === 1 ? strings.review.today.attemptSingular : strings.review.today.attemptPlural;

  return (
    <View
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      className="gap-3 rounded-2xl border p-4"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
            {item.front || strings.review.face.frontEmpty}
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            {item.back || strings.review.face.backEmpty}
          </Text>
        </View>
        <View className="items-end gap-1">
          <View
            accessibilityLabel={
              gotIt ? strings.review.today.gotItA11y : strings.review.today.missedA11y
            }
            style={{ backgroundColor: palette.background }}
            className="flex-row items-center gap-1 rounded-full px-3 py-1"
          >
            <Text style={{ color: palette.text }} className="text-xs font-bold">
              {gotIt ? '✓' : '✗'}
            </Text>
            <Text style={{ color: palette.text }} className="text-xs font-semibold">
              {strings.review.ratings[item.finalRating]}
            </Text>
          </View>
          {item.attempts > 1 ? (
            <Text style={{ color: colors.textSecondary }} className="text-xs">
              {`${item.attempts} ${attemptsLabel}`}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/**
 * Day review history (§33 #12). Reachable from Home "All reviewed for today" card;
 * lists each card studied today with final rating and correct/incorrect indication.
 */
export function TodayReviewsScreen() {
  const router = useRouter();
  const strings = useStrings();
  const { colors } = useTheme();
  const { data, isLoading, isError, refetch } = useTodayReviews();

  const reviews = data ?? [];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 gap-6 px-4 pt-2">
        <Header
          variant="page"
          title={strings.review.today.title}
          subtitle={strings.review.today.subtitle}
          onBack={() => router.back()}
        />

        {isLoading ? (
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            {strings.review.today.loading}
          </Text>
        ) : isError ? (
          <StateCard
            title={strings.review.today.loadError}
            action={{
              label: strings.common.retry,
              accessibilityLabel: strings.review.today.loadRetryA11y,
              onPress: () => void refetch(),
              variant: 'secondary',
            }}
          />
        ) : reviews.length === 0 ? (
          <StateCard
            title={strings.review.today.emptyTitle}
            description={strings.review.today.emptySubtitle}
            action={{
              label: strings.common.back,
              onPress: () => router.back(),
              variant: 'secondary',
            }}
          />
        ) : (
          <FlatList
            data={reviews}
            keyExtractor={(item) => item.cardId}
            renderItem={({ item }) => <ReviewedCardRow item={item} />}
            ItemSeparatorComponent={() => <View className="h-3" />}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
