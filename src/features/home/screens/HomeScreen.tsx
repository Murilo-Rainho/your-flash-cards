import { type Href, useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
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
import { colors } from '@/theme';

/**
 * Home/Dashboard (§33) — hub que responde "o que preciso estudar hoje?".
 *
 * UI burra: consome dados via `useHomeData`, usa serviços da feature para derivar estado
 * de apresentação e delega navegação/ações.
 */
export function HomeScreen() {
  const router = useRouter();
  const { greeting, summary, collections, quickActions, error, isLoading, isRefreshing, refetch } =
    useHomeData();
  const loadedCollections = !isLoading && !error ? collections : undefined;
  const reviewNowCardState = getReviewNowCardState({
    dueCards: summary.dueCards,
    collections: loadedCollections,
  });
  const shouldGuideFirstCollection = reviewNowCardState.action === 'create-collection';

  const handleReviewPress = () => {
    if (reviewNowCardState.route) {
      router.push(reviewNowCardState.route as Href);
      return;
    }

    console.log('[Home] Revisar agora');
  };

  const handleCollectionPress = (item: CollectionSummary) => {
    console.log('[Home] Abrir coleção', item.collection.id);
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
          <HomeHeader greeting={greeting} dueCards={summary.dueCards} />

          <ReviewNowCard state={reviewNowCardState} onPress={handleReviewPress} />

          <View className="gap-3">
            <Text className="text-lg font-semibold text-textPrimary">Progresso Hoje</Text>
            <ProgressStatsGrid
              reviewedToday={summary.reviewedToday}
              retentionPercentage={summary.retentionPercentage}
              streakDays={summary.streakDays}
              masteredCards={summary.masteredCards}
            />
          </View>

          <View className="gap-3">
            <Text className="text-lg font-semibold text-textPrimary">Coleções</Text>
            {isLoading ? (
              <Text className="text-sm text-textSecondary">Carregando dados locais...</Text>
            ) : error ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tentar carregar a Home novamente"
                onPress={refetch}
                className="rounded-2xl border border-border bg-surface p-4 active:opacity-90"
              >
                <Text className="text-base font-semibold text-textPrimary">
                  Não foi possível carregar os dados locais
                </Text>
                <Text className="mt-1 text-sm text-textSecondary">
                  Toque para tentar novamente.
                </Text>
              </Pressable>
            ) : collections.length === 0 ? (
              <Text className="text-sm text-textSecondary">Nenhuma coleção criada ainda.</Text>
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
