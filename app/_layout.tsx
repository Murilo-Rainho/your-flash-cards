import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@/providers/AppProviders';
import { theme } from '@/theme';

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background.DEFAULT },
          headerTintColor: theme.colors.content.primary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.background.DEFAULT },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Your Flash Cards' }} />
      </Stack>
    </AppProviders>
  );
}
