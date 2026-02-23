/**
 * 점사(수호신) 선택 페이지
 * 좌우 스와이프 카드 + 카드 뒤집기(세부정보) + CTA
 */
import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
  FlatList,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { GUARDIANS, getRecommendedGuardian } from '../../src/data/guardians';
import type { GuardianData } from '../../src/data/guardians';
import type { OhangKey } from '../../src/types';
import { Colors } from '../../src/styles/tokens';
import { useAppStore } from '../../src/store';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CARD_W = SCREEN_W * 0.78;
const CARD_H = SCREEN_H * 0.52;
const CARD_MARGIN = (SCREEN_W - CARD_W) / 2;

const CREAM = '#F5F0E8';
const PURPLE_MAIN = '#6B21A8';
const TEXT_DARK = '#2D2D2D';

// ── 스탯 바 ───────────────────────────────────────

function StatBar({ label, values, theme }: {
  label: string;
  values: Record<OhangKey, number>;
  theme: GuardianData['theme'];
}) {
  const order: OhangKey[] = ['목', '화', '토', '금', '수'];
  return (
    <View style={statStyles.row}>
      <Text style={statStyles.label}>{label}</Text>
      <View style={statStyles.bars}>
        {order.map((key) => (
          <View
            key={key}
            style={[
              statStyles.segment,
              {
                backgroundColor: values[key] >= 3 ? theme.primary : '#D1D5DB',
                opacity: values[key] >= 1 ? 0.3 + values[key] * 0.14 : 0.2,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const statStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  label: { fontSize: 12, color: '#6B7280', fontWeight: '600', width: 32 },
  bars: { flexDirection: 'row', flex: 1, gap: 4, marginLeft: 8 },
  segment: { flex: 1, height: 12, borderRadius: 3 },
});

// ── 카드 앞면 ─────────────────────────────────────

function CardFront({ guardian }: { guardian: GuardianData }) {
  const t = guardian.theme;
  return (
    <View style={[frontStyles.card, { borderColor: t.cardBorder }]}>
      {/* 캐릭터 이미지 영역 (placeholder) */}
      <View style={[frontStyles.imageArea, { backgroundColor: t.bgGradientEnd }]}>
        <View style={[frontStyles.imagePlaceholder, { backgroundColor: t.glow }]}>
          <Text style={frontStyles.imageEmoji}>
            {guardian.element === '수' ? '🐉' :
             guardian.element === '화' ? '🐕' :
             guardian.element === '목' ? '🐯' :
             guardian.element === '금' ? '🐢' : '🐻'}
          </Text>
        </View>
        <Text style={[frontStyles.glowText, { color: t.primary }]}>
          ✦ 탭하여 뒤집기 ✦
        </Text>
      </View>

      {/* 이름 & 타이틀 */}
      <View style={frontStyles.info}>
        <Text style={[frontStyles.title, { color: t.primary }]}>{guardian.title}</Text>
        <Text style={frontStyles.name}>{guardian.name}</Text>

        {/* 스탯 */}
        <StatBar label="오소" values={guardian.stats.ohso} theme={t} />
        <StatBar label="확신" values={guardian.stats.hwaksin} theme={t} />
      </View>
    </View>
  );
}

const frontStyles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 2,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 8 },
      web: { boxShadow: '0 4px 20px rgba(0,0,0,0.12)' },
    }),
  },
  imageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageEmoji: {
    fontSize: 72,
  },
  glowText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 10,
    opacity: 0.6,
  },
  info: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT_DARK,
    marginTop: 2,
  },
});

// ── 카드 뒷면 ─────────────────────────────────────

function CardBack({ guardian }: { guardian: GuardianData }) {
  const t = guardian.theme;
  return (
    <View style={[backStyles.card, { borderColor: t.cardBorder }]}>
      <ScrollView
        style={backStyles.scroll}
        contentContainerStyle={backStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[backStyles.name, { color: t.primary }]}>
          {guardian.name} ({guardian.hanja})
        </Text>
        <Text style={backStyles.element}>
          {guardian.title}
        </Text>

        <View style={backStyles.divider} />

        <Text style={backStyles.sectionTitle}>📖 소개</Text>
        <Text style={backStyles.desc}>{guardian.description}</Text>

        <Text style={backStyles.sectionTitle}>🎨 외형</Text>
        <Text style={backStyles.desc}>{guardian.appearance}</Text>

        <Text style={backStyles.sectionTitle}>✨ 특별한 특징</Text>
        <Text style={backStyles.desc}>{guardian.specialFeature}</Text>

        <Text style={backStyles.sectionTitle}>💫 성격</Text>
        <Text style={backStyles.desc}>{guardian.personality}</Text>

        <Text style={backStyles.sectionTitle}>🐾 모티브</Text>
        <Text style={backStyles.desc}>{guardian.motif}</Text>

        <Pressable style={backStyles.flipHint}>
          <Text style={[backStyles.flipText, { color: t.primary }]}>✦ 탭하여 앞면 보기 ✦</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const backStyles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 2,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 8 },
      web: { boxShadow: '0 4px 20px rgba(0,0,0,0.12)' },
    }),
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 22 },
  name: { fontSize: 24, fontWeight: '800' },
  element: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 14 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: TEXT_DARK, marginTop: 14, marginBottom: 6 },
  desc: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  flipHint: { alignItems: 'center', marginTop: 20, paddingBottom: 10 },
  flipText: { fontSize: 12, fontWeight: '500', opacity: 0.6 },
});

// ── 플립 카드 ─────────────────────────────────────

function FlipCard({ guardian, isActive }: { guardian: GuardianData; isActive: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const rotation = useSharedValue(0);

  const toggleFlip = () => {
    const next = !flipped;
    setFlipped(next);
    rotation.value = withSpring(next ? 180 : 0, {
      damping: 18,
      stiffness: 90,
    });
  };

  const frontAnimStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [0, 180],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden' as const,
      opacity: rotateY > 90 ? 0 : 1,
    };
  });

  const backAnimStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [180, 360],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden' as const,
      opacity: rotateY > 90 && rotateY < 270 ? 1 : 0,
    };
  });

  return (
    <Pressable onPress={toggleFlip} style={flipStyles.wrapper}>
      {/* 앞면 */}
      <Animated.View style={[flipStyles.face, frontAnimStyle]}>
        <CardFront guardian={guardian} />
      </Animated.View>
      {/* 뒷면 */}
      <Animated.View style={[flipStyles.face, flipStyles.back, backAnimStyle]}>
        <CardBack guardian={guardian} />
      </Animated.View>
    </Pressable>
  );
}

const flipStyles = StyleSheet.create({
  wrapper: {
    width: CARD_W,
    height: CARD_H,
  },
  face: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  back: {
    // 뒷면은 앞면 위에 겹침
  },
});

// ── 장식 요소 ─────────────────────────────────────

const DECOR = [
  { x: 20, y: 60, size: 18, color: '#B0C4DE', rotation: 20 },
  { x: SCREEN_W - 40, y: 80, size: 14, color: '#C8B8E8', rotation: -15 },
  { x: SCREEN_W - 60, y: 120, size: 10, color: '#D4CCE8', rotation: 45 },
  { x: 30, y: SCREEN_H - 130, size: 16, color: '#B0C4DE', rotation: -25 },
  { x: SCREEN_W - 50, y: SCREEN_H - 150, size: 20, color: '#C8B8E8', rotation: 10 },
];

// ── 메인 컴포넌트 ─────────────────────────────────

export default function GuardianScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    weakestElement?: string;
    ohang?: string;
    name?: string;
  }>();

  const weakest = (params.weakestElement as OhangKey) ?? '수';

  // 추천 순서: 약한 오행 먼저 → 나머지
  const sortedGuardians = [...GUARDIANS].sort((a, b) => {
    if (a.element === weakest) return -1;
    if (b.element === weakest) return 1;
    return 0;
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / SCREEN_W);
    if (idx >= 0 && idx < sortedGuardians.length && idx !== activeIndex) {
      setActiveIndex(idx);
    }
  }, [activeIndex, sortedGuardians.length]);

  // CTA 버튼 애니메이션
  const buttonScale = useSharedValue(1);
  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleSelect = () => {
    const selected = sortedGuardians[activeIndex];

    // Zustand 스토어에 수호신 저장 + 49일 퀘스트 시작
    const store = useAppStore.getState();
    store.setGuardian(selected.id);
    store.startQuest49();

    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    router.replace('/(tabs)/dashboard');
  };

  const activeGuardian = sortedGuardians[activeIndex];
  const theme = activeGuardian.theme;

  return (
    <View style={styles.container}>
      {/* 장식 */}
      {DECOR.map((d, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: d.x,
            top: d.y,
            width: d.size * 0.6,
            height: d.size,
            backgroundColor: d.color,
            borderRadius: 3,
            opacity: 0.5,
            transform: [{ rotate: `${d.rotation}deg` }],
          }}
        />
      ))}

      {/* 뒤로가기 */}
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </Pressable>

      {/* 제목 */}
      <View style={styles.header}>
        <Text style={styles.title}>운명을 개척할{'\n'}길잡이를 선택하세요</Text>
      </View>

      {/* 페이지 인디케이터 */}
      <View style={styles.dots}>
        {sortedGuardians.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex
                ? { backgroundColor: theme.primary, width: 10, height: 10 }
                : { backgroundColor: '#D1D5DB', width: 8, height: 8 },
            ]}
          />
        ))}
      </View>

      {/* 카드 스와이프 */}
      <FlatList
        ref={flatListRef}
        data={sortedGuardians}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={styles.cardContainer}>
            <FlipCard guardian={item} isActive={index === activeIndex} />
          </View>
        )}
      />

      {/* 추천 뱃지 */}
      {activeGuardian.element === weakest && (
        <View style={[styles.recommendBadge, { backgroundColor: theme.primary }]}>
          <Text style={styles.recommendText}>✨ 추천</Text>
        </View>
      )}

      {/* CTA */}
      <View style={styles.ctaArea}>
        <Animated.View style={[styles.ctaBtnWrap, buttonAnimStyle]}>
          <Pressable
            style={[styles.ctaBtn, { backgroundColor: PURPLE_MAIN }]}
            onPress={handleSelect}
            onPressIn={() => { buttonScale.value = withSpring(0.97); }}
            onPressOut={() => { buttonScale.value = withSpring(1); }}
          >
            <Text style={styles.ctaBtnText}>이 점사와 49일 계약하기</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

// ── 스타일 ────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  backText: {
    fontSize: 24,
    color: TEXT_DARK,
  },
  header: {
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: TEXT_DARK,
    textAlign: 'center',
    lineHeight: 34,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  dot: {
    borderRadius: 5,
  },
  listContent: {
    // FlatList padding
  },
  cardContainer: {
    width: SCREEN_W,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendBadge: {
    position: 'absolute',
    top: SCREEN_H * 0.17,
    right: SCREEN_W * 0.08,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 5,
  },
  recommendText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  ctaArea: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 8,
  },
  ctaBtnWrap: {
    width: '100%',
  },
  ctaBtn: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: PURPLE_MAIN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 8 },
      web: { boxShadow: '0 6px 16px rgba(107, 33, 168, 0.3)' },
    }),
  },
  ctaBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
