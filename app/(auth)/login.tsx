/**
 * 로그인 / 가입 화면
 * 구글 + 카카오 소셜 로그인
 */
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signInWithGoogle, signInWithKakao } from '../../src/services/auth';
import { loadUserProfile } from '../../src/services/firestore';
import { useAppStore } from '../../src/store';
import { AppColors } from '../../src/styles/tokens';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── 장식 요소 ──
const CRYSTALS = [
  { x: 20, y: 80, size: 60, color: '#9B7EC8', rotation: -25 },
  { x: SCREEN_W - 70, y: 100, size: 50, color: '#D4C5A0', rotation: 15 },
  { x: 40, y: SCREEN_H - 300, size: 20, color: '#7DD3C0', rotation: 0 },
  { x: SCREEN_W - 90, y: SCREEN_H - 280, size: 24, color: '#C8B8E8', rotation: 30 },
  { x: 60, y: 200, size: 14, color: '#4A5899', rotation: 0 },
  { x: SCREEN_W - 50, y: 220, size: 12, color: '#6A7EC8', rotation: 0 },
];

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState<'google' | 'kakao' | null>(null);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setLoading('google');
      setError('');
      const user = await signInWithGoogle();

      // Firestore에서 기존 데이터 확인
      const hasData = await loadUserProfile(user.uid);

      // 스토어에 인증 정보 저장
      useAppStore.getState().setAuthUser(user.uid, user.email || '', 'google');

      if (hasData && useAppStore.getState().onboardingComplete) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(onboarding)/scan');
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || '구글 로그인에 실패했습니다.');
    } finally {
      setLoading(null);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      setLoading('kakao');
      setError('');
      const user = await signInWithKakao();

      const hasData = await loadUserProfile(user.uid);
      useAppStore.getState().setAuthUser(user.uid, user.email || '', 'kakao');

      if (hasData && useAppStore.getState().onboardingComplete) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(onboarding)/scan');
      }
    } catch (err: any) {
      console.error('Kakao login error:', err);
      setError(err.message || '카카오 로그인에 실패했습니다.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* 장식 크리스탈 */}
      {CRYSTALS.map((c, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: c.x,
            top: c.y,
            width: c.size * (c.size > 30 ? 0.5 : 1),
            height: c.size,
            backgroundColor: c.color,
            borderRadius: c.size > 30 ? 4 : c.size,
            opacity: 0.5,
            transform: [{ rotate: `${c.rotation}deg` }],
          }}
        />
      ))}

      {/* 로고 영역 */}
      <Animated.View entering={FadeIn.delay(200).duration(800)} style={styles.logoSection}>
        <Text style={styles.moonIcon}>☽</Text>
        <Text style={styles.logoText}>역운49</Text>
        <Text style={styles.tagline}>49일간의 운명 전쟁</Text>
      </Animated.View>

      {/* 버튼 영역 */}
      <Animated.View entering={SlideInUp.delay(600).duration(600)} style={styles.buttonSection}>
        {/* 구글 로그인 */}
        <Pressable
          style={[styles.socialBtn, styles.googleBtn]}
          onPress={handleGoogleLogin}
          disabled={loading !== null}
        >
          {loading === 'google' ? (
            <ActivityIndicator color="#333" size="small" />
          ) : (
            <>
              <View style={styles.googleIconWrap}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>Google로 시작하기</Text>
            </>
          )}
        </Pressable>

        {/* 카카오 로그인 */}
        <Pressable
          style={[styles.socialBtn, styles.kakaoBtn]}
          onPress={handleKakaoLogin}
          disabled={loading !== null}
        >
          {loading === 'kakao' ? (
            <ActivityIndicator color="#3C1E1E" size="small" />
          ) : (
            <>
              <View style={styles.kakaoIconWrap}>
                <Ionicons name="chatbubble" size={18} color="#3C1E1E" />
              </View>
              <Text style={styles.kakaoBtnText}>카카오로 시작하기</Text>
            </>
          )}
        </Pressable>

        {/* 개발자 테스트 인증 (DEV 전용) */}
        {__DEV__ !== false && (
          <Pressable
            style={[styles.socialBtn, styles.devBtn]}
            onPress={() => {
              const testUid = 'dev-test-user-001';
              const testEmail = 'dev@yeokun49.test';
              useAppStore.getState().setAuthUser(testUid, testEmail, 'google');

              if (useAppStore.getState().onboardingComplete && useAppStore.getState().guardianId) {
                router.replace('/(tabs)/dashboard');
              } else {
                router.replace('/(onboarding)/scan');
              }
            }}
            disabled={loading !== null}
          >
            <View style={styles.devIconWrap}>
              <Ionicons name="bug" size={18} color="#FFF" />
            </View>
            <Text style={styles.devBtnText}>테스트 인증 (개발용)</Text>
          </Pressable>
        )}

        {/* 에러 메시지 */}
        {error ? (
          <Animated.View entering={FadeIn.duration(300)}>
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        ) : null}
      </Animated.View>

      {/* 하단 약관 */}
      <Animated.View entering={FadeIn.delay(900).duration(500)} style={styles.footer}>
        <Text style={styles.footerText}>
          시작하면{' '}
          <Text style={styles.footerLink}>이용약관</Text> 및{' '}
          <Text style={styles.footerLink}>개인정보 처리방침</Text>에
          동의하게 됩니다.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.cream,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  // ── 로고 ──
  logoSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  moonIcon: {
    fontSize: 40,
    color: '#8B8B8B',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    color: AppColors.textDark,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 15,
    color: AppColors.textMuted,
    marginTop: 8,
    letterSpacing: 2,
  },

  // ── 버튼 영역 ──
  buttonSection: {
    width: '100%',
    maxWidth: 360,
    gap: 14,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
      default: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    }),
  },

  // 구글 버튼
  googleBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  googleIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleG: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  // 카카오 버튼
  kakaoBtn: {
    backgroundColor: '#FEE500',
  },
  kakaoIconWrap: {
    marginRight: 10,
  },
  kakaoBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C1E1E',
  },

  // 개발자 테스트 버튼
  devBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  devIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  devBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },

  // 에러
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 4,
  },

  // 하단 약관
  footer: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 32,
  },
  footerText: {
    fontSize: 11,
    color: AppColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: AppColors.purpleMain,
    textDecorationLine: 'underline',
  },
});
