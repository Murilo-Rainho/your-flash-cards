import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, useRouter } from 'expo-router';

import { FlashcardReview } from '@/components/review';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { StateCard } from '@/components/common/StateCard';
import { ROUTES } from '@/constants/routes';
import { useReviewSession } from '@/features/review/hooks/useReviewSession';
import { serializeReviewStats } from '@/features/review/services/reviewResultParams';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';

/**
 * Sessão de estudo (§33 #11, §35) — UI burra que consome `useReviewSession` e reaproveita o
 * `FlashcardReview`. Trata carregando / vazio / sessão ativa e, ao terminar, navega ao resultado.
 */
export function ReviewScreen() {
  const router = useRouter();
  const strings = useStrings();
  const { colors } = useTheme();
  const session = useReviewSession();
  const { current, total } = session.progress;
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  useEffect(() => {
    if (session.isFinished) {
      router.replace({
        pathname: ROUTES.REVIEW_RESULT,
        params: serializeReviewStats(session.stats),
      } as Href);
    }
  }, [session.isFinished, session.stats, router]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 gap-6 px-4 pt-2">
        <ScreenHeader title={strings.review.session.title} onBack={() => router.back()} />

        {session.isLoading ? (
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            {strings.review.session.loading}
          </Text>
        ) : session.isEmpty ? (
          <StateCard
            title={strings.review.session.emptyTitle}
            description={strings.review.session.emptySubtitle}
            action={{
              label: strings.common.back,
              onPress: () => router.back(),
              variant: 'secondary',
            }}
          />
        ) : (
          <View className="gap-2">
            <View
              accessibilityRole="progressbar"
              accessibilityLabel={`${strings.review.session.progressA11y}: ${current}/${total}`}
              style={{ backgroundColor: colors.surface }}
              className="h-2 w-full overflow-hidden rounded-full"
            >
              <View
                style={{ backgroundColor: colors.primary, width: `${percent}%` }}
                className="h-full"
              />
            </View>
            <Text style={{ color: colors.textSecondary }} className="text-sm font-medium">
              {`${current} / ${total}`}
            </Text>
          </View>
        )}
      </View>

      {session.viewModel ? (
        <FlashcardReview
          visible
          cardKey={session.cardKey}
          card={session.viewModel}
          strings={strings.review}
          onRate={session.handleRate}
          onClose={() => router.back()}
          onFlip={session.handleFlip}
        />
      ) : null}
    </SafeAreaView>
  );
}
