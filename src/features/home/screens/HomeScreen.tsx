import { type Href, useRouter } from 'expo-router';
import { RefreshControl, ScrollView, View } from 'react-native';

import { routeHrefs } from '@/constants/routes';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/components/common/Header';
import { SectionTitle } from '@/components/common/SectionTitle';
import { StateCard } from '@/components/common/StateCard';
import type { QuickAction } from '@/domain/entities/QuickAction';
import { CollectionListSkeleton } from '@/features/home/components/CollectionListSkeleton';
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
 * Home/Dashboard (§33) — hub answering "what do I need to study today?".
 *
 * Dumb UI: consumes data via `useHomeData`, uses feature services to derive state
 * presentation and delegates navigation/actions.
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
          <Header variant="home" title={strings.common.appName} />

          <HomeHeader greeting={greeting} dueCards={summary.dueCards} />

          <ReviewNowCard state={reviewNowCardState} onPress={handleReviewPress} />

          <View className="gap-3">
            <SectionTitle title={strings.home.progressTitle} />
            <ProgressStatsGrid
              reviewedToday={summary.reviewedToday}
              retentionPercentage={summary.retentionPercentage}
              streakDays={summary.streakDays}
              masteredCards={summary.masteredCards}
            />
          </View>

          <View className="gap-3">
            <SectionTitle title={strings.home.collectionsTitle} />
            {isLoading ? (
              <CollectionListSkeleton />
            ) : error ? (
              <StateCard
                title={strings.home.loadErrorTitle}
                description={strings.common.retryHint}
                action={{
                  label: strings.common.retry,
                  onPress: refetch,
                  accessibilityLabel: strings.home.loadErrorRetryA11y,
                }}
              />
            ) : collections.length === 0 ? (
              <StateCard title={strings.home.noCollections} />
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
