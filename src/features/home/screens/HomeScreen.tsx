import { type Href, useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { ROUTES, routeHrefs } from '@/constants/routes';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { QuickAction } from '@/domain/entities/QuickAction';
import { CollectionSummaryCard } from '@/features/home/components/CollectionSummaryCard';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { ProgressStatsGrid } from '@/features/home/components/ProgressStatsGrid';
import { QuickActionsFab } from '@/features/home/components/QuickActionsFab';
import { ReviewNowCard } from '@/features/home/components/ReviewNowCard';
import { useHomeData } from '@/features/home/hooks/useHomeData';
import { getReviewNowCardState } from '@/features/home/services/getReviewNowCardState';
import type { CollectionSummary } from '@/features/home/types';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';

/**
 * Home/Dashboard (§33) — hub que responde "o que preciso estudar hoje?".
 *
 * UI burra: consome dados via `useHomeData`, usa serviços da feature para derivar estado
 * de apresentação e delega navegação/ações.
 */
export function HomeScreen() {
  const router = useRouter();
  const strings = useStrings();
  const { colors } = useTheme();
  const { greeting, summary, collections, quickActions, error, isLoading, isRefreshing, refetch } =
    useHomeData();
  const loadedCollections = !isLoading && !error ? collections : undefined;
  const reviewNowCardState = getReviewNowCardState({
    dueCards: summary.dueCards,
    collections: loadedCollections,
    strings: strings.home.reviewNow,
  });
  const shouldGuideFirstCollection = reviewNowCardState.action === 'create-collection';

  const handleReviewPress = () => {
    if (reviewNowCardState.route) {
      router.push(reviewNowCardState.route as Href);
    }
  };

  const handleCollectionPress = (item: CollectionSummary) => {
    router.push(routeHrefs.collectionDetail(item.collection.id) as Href);
  };

  const handleQuickAction = (action: QuickAction) => {
    if (!action.route || action.disabled) {
      console.log('[Home] Ação rápida indisponível', action.id);
      return;
    }

    router.push(action.route as Href);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            tintColor={colors.primary}
            colors={[colors.primary]}
            onRefresh={refetch}
          />
        }
      >
        <View className="gap-6 px-4 pb-28 pt-2">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <HomeHeader greeting={greeting} dueCards={summary.dueCards} />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.common.settings}
              onPress={() => router.push(ROUTES.SETTINGS as Href)}
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              className="rounded-xl border px-3 py-2 active:opacity-90"
            >
              <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                {strings.common.settings}
              </Text>
            </Pressable>
          </View>

          <ReviewNowCard state={reviewNowCardState} onPress={handleReviewPress} />

          <View className="gap-3">
            <Text style={{ color: colors.textPrimary }} className="text-lg font-semibold">
              {strings.home.progressTitle}
            </Text>
            <ProgressStatsGrid
              reviewedToday={summary.reviewedToday}
              retentionPercentage={summary.retentionPercentage}
              streakDays={summary.streakDays}
              masteredCards={summary.masteredCards}
            />
          </View>

          <View className="gap-3">
            <Text style={{ color: colors.textPrimary }} className="text-lg font-semibold">
              {strings.home.collectionsTitle}
            </Text>
            {isLoading ? (
              <Text style={{ color: colors.textSecondary }} className="text-sm">
                {strings.home.loadingLocalData}
              </Text>
            ) : error ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={strings.home.loadErrorRetryA11y}
                onPress={refetch}
                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                className="rounded-2xl border p-4 active:opacity-90"
              >
                <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
                  {strings.home.loadErrorTitle}
                </Text>
                <Text style={{ color: colors.textSecondary }} className="mt-1 text-sm">
                  {strings.common.retryHint}
                </Text>
              </Pressable>
            ) : collections.length === 0 ? (
              <Text style={{ color: colors.textSecondary }} className="text-sm">
                {strings.home.noCollections}
              </Text>
            ) : (
              collections.map((item) => (
                <CollectionSummaryCard
                  key={item.collection.id}
                  summary={item}
                  onPress={() => handleCollectionPress(item)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <QuickActionsFab
        actions={quickActions}
        showFirstCollectionHint={shouldGuideFirstCollection}
        onActionPress={handleQuickAction}
      />
    </SafeAreaView>
  );
}
