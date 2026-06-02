import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Screen, Text } from '@/components/ui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Não encontrado' }} />
      <Screen>
        <View className="flex-1 items-center justify-center gap-4">
          <Text variant="subtitle">Esta tela não existe.</Text>
          <Link href="/" className="text-base font-semibold text-primary">
            Voltar para o início
          </Link>
        </View>
      </Screen>
    </>
  );
}
