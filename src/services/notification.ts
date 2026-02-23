import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export const requestNotificationPermission = async (): Promise<boolean> => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  return enabled;
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    return token;
  } catch {
    return null;
  }
};

export const setupForegroundHandler = () => {
  return messaging().onMessage(async (remoteMessage) => {
    // TODO: 포그라운드 알림 표시 (예: 일일 퀘스트 알림)
    console.log('[FCM] Foreground message:', remoteMessage.notification?.title);
  });
};

export const setupBackgroundHandler = () => {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    // TODO: 백그라운드 메시지 처리
    console.log('[FCM] Background message:', remoteMessage.notification?.title);
  });
};

export const setupNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    // Android 알림 채널은 @react-native-firebase/messaging에서 자동 생성
    // 커스텀 채널이 필요한 경우 notifee 라이브러리 사용 가능
  }
};
