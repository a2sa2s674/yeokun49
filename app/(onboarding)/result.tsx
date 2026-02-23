/**
 * 운명 스캔 결과 페이지
 * 사주팔자 오행 분석 결과 + 레이더 차트 + 강점/약점 카드
 */
import { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import OhangRadarChart from '../../src/components/OhangRadarChart';
import { calculateOhang, getOhangInterpretation } from '../../src/lib/saju';
import { Colors } from '../../src/styles/tokens';
import type { OhangKey } from '../../src/types';

const { width } = Dimensions.get('window');

const CREAM = '#F5F0E8';
const PURPLE_MAIN = '#6B21A8';
const GOLD_BORDER = '#C9B87A';
const TEXT_DARK = '#2D2D2D';
const CARD_BG = 'rgba(255,255,255,0.80)';

// ── 로딩 화면 ─────────────────────────────────────

function LoadingView({ name }: { name: string }) {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={loadStyles.container}>
      <Animated.View style={pulseStyle}>
        <Text style={loadStyles.icon}>☽</Text>
      </Animated.View>
      <Text style={loadStyles.text}>
        {name}님의 운명을{'\n'}스캔하고 있습니다...
      </Text>
      <ActivityIndicator color={PURPLE_MAIN} size="small" style={{ marginTop: 24 }} />
    </View>
  );
}

const loadStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  icon: { fontSize: 56, color: PURPLE_MAIN, marginBottom: 20 },
  text: {
    fontSize: 18,
    color: TEXT_DARK,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
  },
});

// ── 해석 카드 ─────────────────────────────────────

function InterpretationCard({
  icon,
  title,
  description,
  element,
  variant,
  index,
}: {
  icon: string;
  title: string;
  description: string;
  element: OhangKey;
  variant: 'strength' | 'weakness';
  index: number;
}) {
  const borderColor =
    variant === 'weakness' ? Colors.ohang.수 : Colors.ohang[element];

  return (
    <View style={[cardStyles.card, { borderColor, borderLeftWidth: 4 }]}>
      <View style={cardStyles.header}>
        <View style={cardStyles.indexBadge}>
          <Text style={cardStyles.indexText}>{index}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={cardStyles.title}>
            {icon} {title}
          </Text>
        </View>
      </View>
      <Text style={cardStyles.description}>{description}</Text>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    marginBottom: 14,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  indexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PURPLE_MAIN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  indexText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    paddingLeft: 34,
  },
});

// ── 메인 컴포넌트 ─────────────────────────────────

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string;
    year: string;
    month: string;
    day: string;
    birthTime: string;
    gender: string;
  }>();

  const [isCalculating, setIsCalculating] = useState(true);

  // 사주 계산
  const sajuResult = useMemo(() => {
    return calculateOhang({
      name: params.name ?? '',
      year: parseInt(params.year ?? '2000', 10),
      month: parseInt(params.month ?? '1', 10),
      day: parseInt(params.day ?? '1', 10),
      birthTime: params.birthTime ?? '모름',
      gender: (params.gender as '남' | '여') ?? '남',
    });
  }, [params.name, params.year, params.month, params.day, params.birthTime, params.gender]);

  const interpretation = useMemo(
    () => getOhangInterpretation(sajuResult.strongest, sajuResult.weakest),
    [sajuResult]
  );

  // 로딩 연출 (1.8초)
  useEffect(() => {
    const timer = setTimeout(() => setIsCalculating(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  // CTA 버튼 애니메이션
  const buttonScale = useSharedValue(1);
  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleNext = () => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    router.push({
      pathname: '/(onboarding)/guardian',
      params: {
        weakestElement: sajuResult.weakest,
        ohang: JSON.stringify(sajuResult.ohang),
        name: params.name,
      },
    });
  };

  if (isCalculating) {
    return <LoadingView name={params.name ?? ''} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 제목 */}
        <Animated.View entering={FadeIn.delay(200).duration(600)} style={styles.header}>
          <Text style={styles.title}>운명 스캔 완료</Text>
          <Text style={styles.subtitle}>
            {params.name}님의 타고난 명식입니다
          </Text>
        </Animated.View>

        {/* 레이더 차트 */}
        <Animated.View entering={FadeIn.delay(500).duration(800)} style={styles.chartWrap}>
          <OhangRadarChart data={sajuResult.ohang} size={Math.min(width * 0.88, 380)} />
        </Animated.View>

        {/* 종합 해석 */}
        <Animated.View entering={SlideInUp.delay(900).duration(600)} style={styles.summaryWrap}>
          <Text style={styles.summaryText}>{interpretation.summaryText}</Text>
        </Animated.View>

        {/* 강점 카드 */}
        <Animated.View entering={SlideInUp.delay(1100).duration(600)}>
          <InterpretationCard
            icon={interpretation.strengthCard.icon}
            title={interpretation.strengthCard.title}
            description={interpretation.strengthCard.description}
            element={interpretation.strengthCard.element}
            variant="strength"
            index={1}
          />
        </Animated.View>

        {/* 약점 카드 */}
        <Animated.View entering={SlideInUp.delay(1300).duration(600)}>
          <InterpretationCard
            icon={interpretation.weaknessCard.icon}
            title={interpretation.weaknessCard.title}
            description={interpretation.weaknessCard.description}
            element={interpretation.weaknessCard.element}
            variant="weakness"
            index={2}
          />
        </Animated.View>

        {/* CTA */}
        <Animated.View entering={FadeIn.delay(1600).duration(600)} style={styles.ctaSection}>
          <Text style={styles.ctaText}>{interpretation.ctaText}</Text>

          <Animated.View style={[styles.ctaBtnWrap, buttonAnimStyle]}>
            <Pressable
              style={styles.ctaBtn}
              onPress={handleNext}
              onPressIn={() => { buttonScale.value = withSpring(0.97); }}
              onPressOut={() => { buttonScale.value = withSpring(1); }}
            >
              <Text style={styles.ctaBtnText}>나의 수호 점사 선택하기</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ── 스타일 ────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  scroll: {
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: PURPLE_MAIN,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_DARK,
    marginTop: 8,
  },
  chartWrap: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  summaryWrap: {
    alignItems: 'center',
    marginHorizontal: 28,
    marginBottom: 22,
  },
  summaryText: {
    fontSize: 16,
    color: TEXT_DARK,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 24,
  },
  ctaSection: {
    alignItems: 'center',
    marginTop: 6,
    marginHorizontal: 24,
    marginBottom: 30,
  },
  ctaText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
  },
  ctaBtnWrap: {
    width: '100%',
  },
  ctaBtn: {
    height: 58,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PURPLE_MAIN,
    borderWidth: 1.5,
    borderColor: GOLD_BORDER,
    ...Platform.select({
      ios: {
        shadowColor: PURPLE_MAIN,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0 6px 16px rgba(107, 33, 168, 0.35)' },
    }),
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
