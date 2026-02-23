import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useAppStore } from '../src/store';

const { width, height } = Dimensions.get('window');

const CREAM = '#F5F0E8';

// 크리스탈/구슬 장식 데이터
const decorations = [
  // 좌상단 큰 크리스탈 (보라)
  { x: -20, y: 60, size: 80, color: '#9B7EC8', rotation: -30, shape: 'crystal' },
  // 우상단 부채 영역 (원형으로 대체)
  { x: width - 80, y: 80, size: 60, color: '#D4C5A0', rotation: 15, shape: 'circle' },
  // 좌측 청록 구슬
  { x: 40, y: 280, size: 24, color: '#7DD3C0', rotation: 0, shape: 'circle' },
  // 우측 연보라 구슬
  { x: width - 100, y: 240, size: 20, color: '#C8B8E8', rotation: 0, shape: 'circle' },
  // 좌하단 타로카드 영역
  { x: 10, y: height - 260, size: 50, color: '#E8D5A0', rotation: -10, shape: 'card' },
  { x: 60, y: height - 220, size: 50, color: '#E8D5A0', rotation: 5, shape: 'card' },
  // 우하단 크리스탈 (보라)
  { x: width - 80, y: height - 200, size: 60, color: '#9B7EC8', rotation: 25, shape: 'crystal' },
  // 하단 청록 구슬
  { x: width - 130, y: height - 140, size: 18, color: '#7DD3C0', rotation: 0, shape: 'circle' },
  // 상단 남색 구슬
  { x: 100, y: 120, size: 16, color: '#4A5899', rotation: 0, shape: 'circle' },
  { x: 140, y: 150, size: 14, color: '#6A7EC8', rotation: 0, shape: 'circle' },
  // 하단 남색 구슬
  { x: 50, y: height - 160, size: 16, color: '#4A5899', rotation: 0, shape: 'circle' },
];

function DecorationItem({
  item,
  index,
}: {
  item: (typeof decorations)[0];
  index: number;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      200 + index * 80,
      withTiming(1, { duration: 600 })
    );
    scale.value = withDelay(
      200 + index * 80,
      withSpring(1, { damping: 12, stiffness: 100 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { rotate: `${item.rotation}deg` },
    ],
  }));

  const shapeStyle =
    item.shape === 'circle'
      ? { borderRadius: item.size }
      : item.shape === 'crystal'
      ? { borderRadius: 4, width: item.size * 0.5, height: item.size }
      : { borderRadius: 4, width: item.size * 0.7, height: item.size };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: item.x,
          top: item.y,
          width: item.size,
          height: item.size,
          backgroundColor: item.color,
          ...shapeStyle,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function SplashAnimated() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // 로고 애니메이션
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.6);
  const logoY = useSharedValue(20);

  // 달 아이콘 애니메이션
  const moonOpacity = useSharedValue(0);
  const moonRotation = useSharedValue(-30);

  // 전체 페이드아웃
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // 로고 등장
    logoOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
    logoScale.value = withDelay(
      600,
      withSpring(1, { damping: 14, stiffness: 90 })
    );
    logoY.value = withDelay(
      600,
      withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) })
    );

    // 달 아이콘 등장
    moonOpacity.value = withDelay(
      1000,
      withTiming(1, { duration: 600 })
    );
    moonRotation.value = withDelay(
      1000,
      withSequence(
        withTiming(10, { duration: 400 }),
        withTiming(0, { duration: 300 })
      )
    );

    // 2.5초 후 페이드아웃 → 네비게이션
    const timer = setTimeout(() => {
      screenOpacity.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(setReady)(true);
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) {
      // 온보딩 완료 여부에 따라 분기
      const { onboardingComplete, guardianId } = useAppStore.getState();
      if (onboardingComplete && guardianId) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(onboarding)/scan');
      }
    }
  }, [ready]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { translateY: logoY.value },
    ],
  }));

  const moonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: moonOpacity.value,
    transform: [{ rotate: `${moonRotation.value}deg` }],
  }));

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenAnimatedStyle]}>
      {/* 장식 요소들 */}
      {decorations.map((item, index) => (
        <DecorationItem key={index} item={item} index={index} />
      ))}

      {/* 중앙 로고 */}
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Animated.View style={[styles.moonContainer, moonAnimatedStyle]}>
          <Text style={styles.moon}>☽</Text>
        </Animated.View>
        <Text style={styles.logoText}>역운49</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  moonContainer: {
    marginBottom: 4,
  },
  moon: {
    fontSize: 32,
    color: '#8B8B8B',
  },
  logoText: {
    fontSize: 52,
    fontWeight: '700',
    color: '#2D2D2D',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
});
