import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // TODO: Firebase, RevenueCat, FCM 초기화는 실제 설정 후 활성화
        // await initFirebase();
        // await initPurchases();
        // await requestNotificationPermission();
      } finally {
        setAppReady(true);
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F5F0E8' },
          animation: 'none',
        }}
      />
    </SafeAreaProvider>
  );
}
