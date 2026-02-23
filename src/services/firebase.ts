import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

export const initFirebase = async () => {
  if (!firebase.apps.length) {
    // Firebase는 google-services.json (Android) / GoogleService-Info.plist (iOS) 기반 자동 초기화
    // app.config.ts의 extra에서 추가 환경변수를 읽어올 수 있음
  }
};

export const db = firestore();
export const fcm = messaging();
