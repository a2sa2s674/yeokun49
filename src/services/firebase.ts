/**
 * Firebase JS SDK (modular v10) 초기화
 * 웹 + 네이티브 모두 호환
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAxQrznuGaaZJk7OSSHR-4i3k57K9R9d5s',
  authDomain: 'yeokun49.firebaseapp.com',
  projectId: 'yeokun49',
  storageBucket: 'yeokun49.firebasestorage.app',
  messagingSenderId: '221412571019',
  appId: '1:221412571019:web:ce74801a9ab9edaf33618e',
  measurementId: 'G-FV32V0L8M6',
};

// 중복 초기화 방지
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
