import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { QuickAction } from '@/domain/entities/QuickAction';
import { CollectionSummaryCard } from '@/features/home/components/CollectionSummaryCard';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { ProgressStatsGrid } from '@/features/home/components/ProgressStatsGrid';
import { QuickActionsFab } from '@/features/home/components/QuickActionsFab';
import { ReviewNowCard } from '@/features/home/components/ReviewNowCard';
import { useHomeData } from '@/features/home/hooks/useHomeData';
import type { CollectionSummary } from '@/features/home/types';
import { colors } from '@/theme';

/**
 * Home/Dashboard (§33) — hub que responde "o que preciso estudar hoje?".
 *
 * UI burra: consome dados via `useHomeData` e delega ações. A navegação ainda não existe,
 * então os handlers apenas registram no console (ponto de extensão futuro).
 */
export function HomeScreen() {
  const { greeting, summary, collections, quickActions } = useHomeData();

  const handleReviewPress = () => {
    console.log('[Home] Revisar agora');
  };

  const handleCollectionPress = (item: CollectionSummary) => {
    console.log('[Home] Abrir coleção', item.collection.id);
  };

  const handleQuickAction = (action: QuickAction) => {
    console.log('[Home] Ação rápida', action.id);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-6 px-4 pb-28 pt-2">
          <HomeHeader greeting={greeting} dueCards={summary.dueCards} />

          <ReviewNowCard dueCards={summary.dueCards} onPress={handleReviewPress} />

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
            {collections.map((item) => (
              <CollectionSummaryCard
                key={item.collection.id}
                summary={item}
                onPress={() => handleCollectionPress(item)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <QuickActionsFab actions={quickActions} onActionPress={handleQuickAction} />
    </SafeAreaView>
  );
}
