import { Pressable, Text } from 'react-native';

import { shadows } from '@/theme';

type ReviewNowCardProps = {
  dueCards: number;
  onPress: () => void;
};

/**
 * CTA principal da Home — o elemento de maior destaque visual.
 * Quando não há cards vencidos, vira um estado de "tudo em dia".
 */
export function ReviewNowCard({ dueCards, onPress }: ReviewNowCardProps) {
  const hasDue = dueCards > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        hasDue ? `Revisar agora, ${dueCards} cards vencidos` : 'Tudo revisado por hoje'
      }
      onPress={onPress}
      style={shadows.lg}
      className="rounded-2xl bg-primary p-6 active:opacity-90"
    >
      <Text className="text-2xl font-bold text-background">
        {hasDue ? 'Revisar agora' : 'Tudo revisado por hoje'}
      </Text>
      <Text className="mt-1 text-base font-medium text-background opacity-90">
        {hasDue
          ? `${dueCards} ${dueCards === 1 ? 'card vencido' : 'cards vencidos'}`
          : 'Volte amanhã para manter o seu streak 🔥'}
      </Text>
    </Pressable>
  );
}
