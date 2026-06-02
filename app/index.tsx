import { View } from 'react-native';
import { Button, Card, Screen, Text } from '@/components/ui';

export default function HomeScreen() {
  return (
    <Screen>
      <View className="flex-1 justify-center gap-6">
        <View className="gap-1">
          <Text variant="title">Your Flash Cards</Text>
          <Text variant="caption">Base com Expo, TypeScript e NativeWind pronta para crescer.</Text>
        </View>

        <Card className="gap-2">
          <Text variant="subtitle">Tema centralizado</Text>
          <Text variant="body">
            Edite os valores em <Text className="font-semibold">src/theme/tokens.js</Text> para
            mudar as cores de todo o app de uma vez.
          </Text>
          <View className="mt-2 flex-row gap-3">
            <View className="h-8 flex-1 rounded-lg bg-income" />
            <View className="h-8 flex-1 rounded-lg bg-expense" />
            <View className="h-8 flex-1 rounded-lg bg-warning" />
            <View className="h-8 flex-1 rounded-lg bg-primary" />
          </View>
        </Card>

        <Button label="Começar" onPress={() => {}} />
      </View>
    </Screen>
  );
}
