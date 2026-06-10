import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, useRouter } from 'expo-router';

import { FlashcardReview } from '@/components/review';
import { Header } from '@/components/common/Header';
import { ProgressBar } from '@/components/common/ProgressBar';
import { StateCard } from '@/components/common/StateCard';
import { ROUTES } from '@/constants/routes';
import { useReviewSession } from '@/features/review/hooks/useReviewSession';
import { serializeReviewStats } from '@/features/review/services/reviewResultParams';
import { usePreferences } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';

/**
 * Sessão de estudo (§33 #11, §35) — UI burra que consome `useReviewSession` e reaproveita o
 * `FlashcardReview`. Trata carregando / vazio / sessão ativa e, ao terminar, navega ao resultado.
 */
export function ReviewScreen() {
  const router = useRouter();
  const { setTtsPlaybackSpeed, strings, ttsPlaybackSpeed } = usePreferences();
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
        <Header variant="page" title={strings.review.session.title} />

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
          <View className="flex-1 gap-4">
            <View className="gap-2">
              <ProgressBar
                value={percent}
                tone="primary"
                accessibilityLabel={`${strings.review.session.progressA11y}: ${current}/${total}`}
              />
              <Text style={{ color: colors.textSecondary }} className="text-sm font-medium">
                {`${current} / ${total}`}
              </Text>
            </View>

            {session.viewModel ? (
              <FlashcardReview
                visible
                presentation="container"
                cardKey={session.cardKey}
                card={session.viewModel}
                strings={strings.review}
                ttsPlaybackSpeed={ttsPlaybackSpeed}
                ttsSpeedLabels={{ fast: strings.common.fast, slow: strings.common.slow }}
                onRate={session.handleRate}
                onFlip={session.handleFlip}
                onTtsPlaybackSpeedChange={(speed) => void setTtsPlaybackSpeed(speed)}
              />
            ) : null}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
