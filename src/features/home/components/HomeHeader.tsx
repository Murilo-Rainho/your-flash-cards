import { Text, View } from 'react-native';

type HomeHeaderProps = {
  greeting: string;
  dueCards: number;
};

/** Cabeçalho de boas-vindas: saudação + quantos cards aguardam revisão hoje. */
export function HomeHeader({ greeting, dueCards }: HomeHeaderProps) {
  const subtitle =
    dueCards > 0
      ? `${dueCards} ${dueCards === 1 ? 'card' : 'cards'} para revisar hoje`
      : 'Nada para revisar agora';

  return (
    <View className="gap-1">
      <Text className="text-3xl font-bold text-textPrimary">{greeting}</Text>
      <Text className="text-base text-textSecondary">{subtitle}</Text>
    </View>
  );
}
