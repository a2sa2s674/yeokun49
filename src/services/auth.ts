/**
 * 인증 서비스 — 구글/카카오 소셜 로그인
 */
import {
  signInWithCredential,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { auth } from './firebase';
import { Platform } from 'react-native';

// 웹 브라우저 세션 완료 처리 (Android/iOS에서 필요)
WebBrowser.maybeCompleteAuthSession();

// ── Google OAuth 설정 ──
const GOOGLE_WEB_CLIENT_ID = '221412571019-PLACEHOLDER.apps.googleusercontent.com';

// Google OAuth discovery 엔드포인트
const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// ── 카카오 OAuth 설정 ──
const KAKAO_REST_API_KEY = 'PLACEHOLDER_KAKAO_KEY';
const KAKAO_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'yeokun49',
  path: 'auth/kakao',
});

const FIREBASE_FUNCTION_URL =
  'https://asia-northeast3-yeokun49.cloudfunctions.net';

// ═══════════════════════════════════════════════════
// 구글 로그인
// ═══════════════════════════════════════════════════
export async function signInWithGoogle(): Promise<User> {
  // expo-auth-session으로 Google OAuth 실행
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'yeokun49',
    path: 'auth/google',
  });

  const request = new AuthSession.AuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
    responseType: AuthSession.ResponseType.IdToken,
    usePKCE: false,
  });

  const result = await request.promptAsync(googleDiscovery);

  if (result.type !== 'success' || !result.params?.id_token) {
    throw new Error('Google 로그인이 취소되었습니다.');
  }

  // Firebase에 Google 자격 증명으로 로그인
  const credential = GoogleAuthProvider.credential(result.params.id_token);
  const userCredential = await signInWithCredential(auth, credential);
  return userCredential.user;
}

// ═══════════════════════════════════════════════════
// 카카오 로그인
// ═══════════════════════════════════════════════════
export async function signInWithKakao(): Promise<User> {
  // 1) 카카오 OAuth로 인가 코드 받기
  const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code`;

  const result = await WebBrowser.openAuthSessionAsync(
    authUrl,
    KAKAO_REDIRECT_URI
  );

  if (result.type !== 'success') {
    throw new Error('카카오 로그인이 취소되었습니다.');
  }

  // URL에서 인가 코드 추출
  const url = new URL(result.url);
  const code = url.searchParams.get('code');
  if (!code) {
    throw new Error('카카오 인가 코드를 받지 못했습니다.');
  }

  // 2) Cloud Function으로 인가 코드 전송 → Firebase Custom Token 받기
  const response = await fetch(
    `${FIREBASE_FUNCTION_URL}/verifyKakaoToken`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri: KAKAO_REDIRECT_URI }),
    }
  );

  if (!response.ok) {
    const errorData = await response.text().catch(() => '');
    throw new Error(`카카오 인증 실패: ${errorData}`);
  }

  const { firebaseToken } = await response.json();

  // 3) Firebase Custom Token으로 로그인
  const userCredential = await signInWithCustomToken(auth, firebaseToken);
  return userCredential.user;
}

// ═══════════════════════════════════════════════════
// 로그아웃
// ═══════════════════════════════════════════════════
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ═══════════════════════════════════════════════════
// 인증 상태 감시
// ═══════════════════════════════════════════════════
export function onAuthChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ═══════════════════════════════════════════════════
// 현재 유저 가져오기
// ═══════════════════════════════════════════════════
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
