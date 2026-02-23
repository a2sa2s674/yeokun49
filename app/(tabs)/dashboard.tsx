/**
 * 메인 로비 대시보드
 * D-day 카운트다운 + 수호신 + 흉살/퀘스트 카드
 */
import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import { useAppStore } from '../../src/store';
import { getGuardianById } from '../../src/data/guardians';
import { getDayOneMockData } from '../../src/data/mockDailyData';
import { AppColors, Colors } from '../../src/styles/tokens';

const { width: SCREEN_W } = Dimensions.get('window');

// ── 수호신 이모지 매핑 ────────────────────────────
const GUARDIAN_EMOJI: Record<string, string> = {
  cheongmyeong: '🐉',
  yeomhwa: '🐕',
  taepung: '🐯',
  musoe: '🐢',
  hwangto: '🐻',
};

// ── 장식 요소 ─────────────────────────────────────
const DECORATIONS = [
  { x: 30, y: 180, size: 14, color: '#C8B8E8', rotation: 20, shape: 'crystal' as const },
  { x: SCREEN_W - 45, y: 160, size: 12, color: '#D4CCE8', rotation: -15, shape: 'crystal' as const },
  { x: 20, y: 320, size: 10, color: '#C8B8E8', rotation: 35, shape: 'crystal' as const },
  { x: SCREEN_W - 60, y: 380, size: 16, color: '#D4CCE8', rotation: -25, shape: 'crystal' as const },
  // 별자리 점
  { x: SCREEN_W - 80, y: 200, size: 4, color: '#9CA3AF', rotation: 0, shape: 'dot' as const },
  { x: SCREEN_W - 60, y: 220, size: 3, color: '#9CA3AF', rotation: 0, shape: 'dot' as const },
  { x: SCREEN_W - 70, y: 240, size: 3.5, color: '#9CA3AF', rotation: 0, shape: 'dot' as const },
  { x: 50, y: 240, size: 3, color: '#9CA3AF', rotation: 0, shape: 'dot' as const },
  { x: 70, y: 260, size: 4, color: '#9CA3AF', rotation: 0, shape: 'dot' as const },
  { x: 55, y: 275, size: 3, color: '#9CA3AF', rotation: 0, shape: 'dot' as const },
];

// ── TopBar ────────────────────────────────────────

function TopBar() {
  const userName = useAppStore((s) => s.userName);
  const points = useAppStore((s) => s.points);
  const hasUnread = useAppStore((s) => s.hasUnreadNotification);

  return (
    <View style={topStyles.container}>
      <View style={topStyles.left}>
        <View style={topStyles.avatar}>
          <Text style={topStyles.avatarText}>
            {userName?.charAt(0) || '?'}
          </Text>
        </View>
        <Text style={topStyles.name} numberOfLines={1}>
          {userName || 'User Name'}
        </Text>
      </View>
      <View style={topStyles.right}>
        <View style={topStyles.pointsBadge}>
          <Text style={topStyles.pointsIcon}>P</Text>
          <Text style={topStyles.pointsText}>{points.toLocaleString()} P</Text>
        </View>
        <Pressable style={topStyles.bellWrap}>
          <Ionicons name="notifications-outline" size={22} color={AppColors.textDark} />
          {hasUnread && <View style={topStyles.redDot} />}
        </Pressable>
      </View>
    </View>
  );
}

const topStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.purpleMain,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textDark,
    maxWidth: 100,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.inputBorder,
  },
  pointsIcon: {
    fontSize: 13,
    fontWeight: '800',
    color: AppColors.goldAccent,
    marginRight: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textDark,
  },
  bellWrap: {
    position: 'relative',
    padding: 4,
  },
  redDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});

// ── CountdownSection ──────────────────────────────

function CountdownSection() {
  const dayIndex = useAppStore((s) => s.dayIndex);
  const daysRemaining = 49 - dayIndex;

  return (
    <Animated.View entering={FadeIn.delay(200).duration(600)} style={countStyles.container}>
      <Text style={countStyles.dDay}>D-{daysRemaining}</Text>
      <Text style={countStyles.subtitle}>운명 전쟁</Text>
    </Animated.View>
  );
}

const countStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  dDay: {
    fontSize: 52,
    fontWeight: '900',
    color: AppColors.textDark,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: AppColors.textLight,
    marginTop: -2,
    letterSpacing: 4,
  },
});

// ── MagicCircle (마법진) ──────────────────────────

function MagicCircle({ glowColor }: { glowColor: string }) {
  const rotateAnim = useSharedValue(0);

  useEffect(() => {
    rotateAnim.value = withRepeat(
      withTiming(360, { duration: 20000 }),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }],
  }));

  return (
    <Animated.View style={[circleStyles.container, animStyle]}>
      {[0.95, 0.75, 0.55].map((scale, i) => (
        <View
          key={i}
          style={[
            circleStyles.ring,
            {
              width: 200 * scale,
              height: 200 * scale,
              borderRadius: 100 * scale,
              borderColor: glowColor,
              opacity: 0.2 + i * 0.1,
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

const circleStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
});

// ── GuardianSection ───────────────────────────────

function GuardianSection() {
  const guardianId = useAppStore((s) => s.guardianId);
  const subGuardians = useAppStore((s) => s.subGuardians);
  const guardian = guardianId ? getGuardianById(guardianId) : null;
  const theme = guardian?.theme;
  const emoji = guardianId ? (GUARDIAN_EMOJI[guardianId] || '🐉') : '🐉';

  // 수호신 떠다니는 애니메이션
  const floatY = useSharedValue(0);
  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000 }),
        withTiming(8, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <Animated.View entering={FadeIn.delay(400).duration(800)} style={guardStyles.container}>
      {/* 마법진 */}
      <View style={guardStyles.magicWrap}>
        <MagicCircle glowColor={theme?.glow || 'rgba(107,33,168,0.3)'} />
      </View>

      <View style={guardStyles.row}>
        {/* 왼쪽: 보조 조력자 */}
        <View style={guardStyles.sideSlot}>
          {subGuardians[0] ? (
            <View>
              <View style={[guardStyles.subCircle, { borderColor: theme?.primary || AppColors.purpleMain }]}>
                <Text style={guardStyles.subEmoji}>{subGuardians[0].emoji}</Text>
              </View>
              <View style={guardStyles.buffBadge}>
                <Text style={guardStyles.buffText}>{subGuardians[0].buffLabel}</Text>
              </View>
            </View>
          ) : (
            <View style={guardStyles.emptySubCircle} />
          )}
        </View>

        {/* 중앙: 메인 수호신 */}
        <Animated.View style={[guardStyles.mainGuardian, floatStyle]}>
          <Text style={guardStyles.guardianEmoji}>{emoji}</Text>
        </Animated.View>

        {/* 오른쪽: 영입 슬롯 */}
        <Pressable style={guardStyles.sideSlot}>
          <View style={guardStyles.recruitCircle}>
            <Text style={guardStyles.plusIcon}>+</Text>
          </View>
          <Text style={guardStyles.recruitLabel}>조력자 영입</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const guardStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    minHeight: 260,
    justifyContent: 'center',
  },
  magicWrap: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  sideSlot: {
    width: 80,
    alignItems: 'center',
  },
  subCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: AppColors.surface,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
      android: { elevation: 4 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    }),
  },
  subEmoji: {
    fontSize: 24,
  },
  buffBadge: {
    backgroundColor: AppColors.purpleMain,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  buffText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  emptySubCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  mainGuardian: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  guardianEmoji: {
    fontSize: 100,
  },
  recruitCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  plusIcon: {
    fontSize: 24,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  recruitLabel: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },
});

// ── WarningCard ───────────────────────────────────

function WarningCard() {
  const dailyWarning = useAppStore((s) => s.dailyWarning);

  return (
    <Animated.View entering={SlideInUp.delay(600).duration(600)}>
      <Pressable style={warnStyles.card}>
        <LinearGradient
          colors={[AppColors.purpleMain, AppColors.purpleDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={warnStyles.gradient}
        >
          <Text style={warnStyles.icon}>⚠</Text>
          <Text style={warnStyles.text} numberOfLines={1}>
            오늘의 흉살: {dailyWarning?.title || '구설수 조심!'}
          </Text>
          <Text style={warnStyles.arrow}>{'>'}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const warnStyles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: AppColors.purpleMain, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 4 },
      web: { boxShadow: '0 3px 12px rgba(107,33,168,0.2)' },
    }),
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  arrow: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '300',
    marginLeft: 8,
  },
});

// ── QuestPreviewCard ──────────────────────────────

function QuestPreviewCard() {
  const todayQuests = useAppStore((s) => s.todayQuests);
  const firstQuest = todayQuests[0];

  return (
    <Animated.View entering={SlideInUp.delay(800).duration(600)}>
      <Pressable style={questStyles.card}>
        <Text style={questStyles.checkIcon}>
          {firstQuest?.completed ? '☑' : '☐'}
        </Text>
        <Text style={questStyles.text} numberOfLines={1}>
          퀘스트: {firstQuest?.title || '따뜻한 차 한 잔 마시기'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const questStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: AppColors.cardBg,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: AppColors.inputBorder,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 6px rgba(0,0,0,0.05)' },
    }),
  },
  checkIcon: {
    fontSize: 18,
    color: AppColors.purpleMain,
    marginRight: 10,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textDark,
  },
});

// ── 메인 컴포넌트 ─────────────────────────────────

export default function LobbyScreen() {
  const guardianId = useAppStore((s) => s.guardianId);
  const todayQuests = useAppStore((s) => s.todayQuests);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);

  // 초기 목 데이터 시드
  useEffect(() => {
    if (guardianId && todayQuests.length === 0) {
      const mock = getDayOneMockData();
      const store = useAppStore.getState();
      store.setDailyWarning(mock.dailyWarning);
      store.setTodayQuests(mock.todayQuests);
      if (store.subGuardians.length === 0) {
        store.addSubGuardian(mock.subGuardians[0]);
      }
    }
  }, [guardianId]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TopBar />
          <CountdownSection />
          <GuardianSection />
          <View style={styles.cardsArea}>
            <WarningCard />
            <QuestPreviewCard />
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* 장식 요소 */}
      {DECORATIONS.map((d, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: d.x,
            top: d.y,
            width: d.shape === 'dot' ? d.size : d.size * 0.6,
            height: d.size,
            backgroundColor: d.color,
            borderRadius: d.shape === 'dot' ? d.size / 2 : 3,
            opacity: d.shape === 'dot' ? 0.4 : 0.5,
            transform: [{ rotate: `${d.rotation}deg` }],
          }}
        />
      ))}
    </View>
  );
}

// ── 스타일 ────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.cream,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  cardsArea: {
    marginTop: 16,
  },
});
