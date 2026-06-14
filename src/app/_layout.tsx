import '../../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PreferencesProvider } from '@/features/settings/providers/PreferencesProvider';
import { TourHost } from '@/features/tour/components/TourHost';
import { TourProvider } from '@/features/tour/providers/TourProvider';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PreferencesProvider>
          <TourProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
            <TourHost />
          </TourProvider>
        </PreferencesProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
