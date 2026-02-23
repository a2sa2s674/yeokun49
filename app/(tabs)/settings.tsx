/**
 * 마이페이지 (설정 탭)
 * 사주 프로필, 49일 진행 현황, 조력자, 설정 관리
 */
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { useAppStore } from '../../src/store';
import { getGuardianById } from '../../src/data/guardians';
import OhangRadarChart from '../../src/components/OhangRadarChart';
import { AppColors, Colors } from '../../src/styles/tokens';
import type { SajuReading } from '../../src/types';

const { width: SCREEN_W } = Dimensions.get('window');

// ── 수호신 이모지 매핑 ────────────────────────────
const GUARDIAN_EMOJI: Record<string, string> = {
  cheongmyeong: '🐉',
  yeomhwa: '🐕',
  taepung: '🐯',
  musoe: '🐢',
  hwangto: '🐻',
};

// ── 오행 한글→한자 ─────────────────────────────────
const ELEMENT_HANJA: Record<string, string> = {
  목: '木',
  화: '火',
  토: '土',
  금: '金',
  수: '水',
};

// ═══════════════════════════════════════════════════
// 프로필 헤더
// ═══════════════════════════════════════════════════
function ProfileHeader({ userName, points }: { userName: string; points: number }) {
  const initial = userName ? userName.charAt(0) : '?';
  return (
    <Animated.View entering={FadeIn.delay(100).duration(500)} style={styles.profileHeader}>
      <View style={styles.avatarLarge}>
        <Text style={styles.avatarLargeText}>{initial}</Text>
      </View>
      <Text style={styles.profileName}>{userName || '여행자'}의 운명 여정</Text>
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsIcon}>🪙</Text>
        <Text style={styles.pointsText}>{points.toLocaleString()} P</Text>
      </View>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════
// 사주 프로필 카드
// ═══════════════════════════════════════════════════
function SajuProfileCard({
  birthDate,
  birthTime,
  gender,
  ohang,
  strongestElement,
  weakestElement,
}: {
  birthDate: string;
  birthTime: string | null;
  gender: '남' | '여';
  ohang: Record<string, number>;
  strongestElement: string;
  weakestElement: string;
}) {
  const formatDate = (d: string) => {
    if (!d) return '미입력';
    const [y, m, day] = d.split('-');
    return `${y}년 ${parseInt(m)}월 ${parseInt(day)}일`;
  };

  return (
    <Animated.View entering={SlideInUp.delay(200).duration(500)} style={styles.card}>
      <Text style={styles.cardTitle}>📋 나의 사주 프로필</Text>
      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>생년월일</Text>
        <Text style={styles.infoValue}>{formatDate(birthDate)}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>태어난 시간</Text>
        <Text style={styles.infoValue}>{birthTime || '모름'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>성별</Text>
        <Text style={styles.infoValue}>{gender === '남' ? '남 ♂' : '여 ♀'}</Text>
      </View>

      <View style={styles.chartWrapper}>
        <OhangRadarChart
          data={ohang as any}
          size={Math.min(SCREEN_W * 0.62, 260)}
        />
      </View>

      <View style={styles.elementRow}>
        <View style={[styles.elementBadge, { backgroundColor: `${Colors.ohang[strongestElement as keyof typeof Colors.ohang]}20` }]}>
          <Text style={styles.elementBadgeEmoji}>💪</Text>
          <Text style={[styles.elementBadgeText, { color: Colors.ohang[strongestElement as keyof typeof Colors.ohang] }]}>
            강점: {strongestElement}({ELEMENT_HANJA[strongestElement]}) {ohang[strongestElement]}%
          </Text>
        </View>
        <View style={[styles.elementBadge, { backgroundColor: `${Colors.ohang[weakestElement as keyof typeof Colors.ohang]}20` }]}>
          <Text style={styles.elementBadgeEmoji}>🛡️</Text>
          <Text style={[styles.elementBadgeText, { color: Colors.ohang[weakestElement as keyof typeof Colors.ohang] }]}>
            약점: {weakestElement}({ELEMENT_HANJA[weakestElement]}) {ohang[weakestElement]}%
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════
// 49일 진행 현황 카드
// ═══════════════════════════════════════════════════
function ProgressCard({
  dayIndex,
  questStartDate,
}: {
  dayIndex: number;
  questStartDate: string | null;
}) {
  const dDay = 49 - dayIndex;
  const dayNumber = dayIndex + 1;
  const progressPercent = Math.round((dayNumber / 49) * 100);
  const progressWidth = `${Math.max(progressPercent, 2)}%`;

  return (
    <Animated.View entering={SlideInUp.delay(300).duration(500)} style={styles.card}>
      <Text style={styles.cardTitle}>⏳ 49일 여정</Text>
      <View style={styles.divider} />

      <View style={styles.progressInfo}>
        <Text style={styles.progressDDay}>D-{dDay}</Text>
        <Text style={styles.progressDot}>•</Text>
        <Text style={styles.progressDayText}>{dayNumber}일차 진행 중</Text>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: progressWidth as any }]} />
      </View>
      <Text style={styles.progressPercent}>{progressPercent}%</Text>

      {questStartDate && (
        <Text style={styles.startDate}>시작일: {questStartDate}</Text>
      )}
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════
// 나의 조력자 카드
// ═══════════════════════════════════════════════════
function GuardianInfoCard({
  guardianId,
  subGuardians,
}: {
  guardianId: string | null;
  subGuardians: { id: string; name: string; emoji: string; buffLabel: string; element: string }[];
}) {
  const guardian = guardianId ? getGuardianById(guardianId) : null;
  const emoji = guardianId ? (GUARDIAN_EMOJI[guardianId] || '🔮') : '🔮';

  return (
    <Animated.View entering={SlideInUp.delay(400).duration(500)} style={styles.card}>
      <Text style={styles.cardTitle}>🛡️ 나의 조력자</Text>
      <View style={styles.divider} />

      {guardian ? (
        <View style={styles.guardianRow}>
          <View style={styles.guardianAvatar}>
            <Text style={styles.guardianEmoji}>{emoji}</Text>
          </View>
          <View style={styles.guardianInfo}>
            <Text style={styles.guardianName}>{guardian.name}</Text>
            <Text style={styles.guardianTitle}>{guardian.title}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noGuardian}>아직 조력자를 선택하지 않았습니다</Text>
      )}

      {subGuardians.length > 0 && (
        <>
          <View style={[styles.divider, { marginTop: 12 }]} />
          <Text style={styles.subGuardianLabel}>보조 조력자</Text>
          {subGuardians.map((sub) => (
            <View key={sub.id} style={styles.subGuardianRow}>
              <Text style={styles.subGuardianEmoji}>{sub.emoji}</Text>
              <Text style={styles.subGuardianName}>{sub.name}</Text>
              <View style={styles.buffBadge}>
                <Text style={styles.buffText}>{sub.buffLabel}</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════
// AI 사주 풀이 카드
// ═══════════════════════════════════════════════════
function AiInterpretationCard({ reading }: { reading: SajuReading }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Animated.View entering={SlideInUp.delay(250).duration(500)} style={styles.card}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={styles.aiCardHeader}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>🔮 AI 사주 풀이</Text>
        </View>
        <Text style={styles.aiToggle}>{expanded ? '▾' : '›'}</Text>
      </Pressable>
      <View style={styles.divider} />

      {expanded ? (
        <View>
          {reading.sections.map((section) => (
            <View key={section.title} style={styles.aiSectionItem}>
              <Text style={styles.aiSectionTitle}>
                {section.icon} {section.title}
              </Text>
              <Text style={styles.aiSectionContent}>{section.content}</Text>
            </View>
          ))}
          <Text style={styles.aiGeneratedAt}>
            생성일: {new Date(reading.generatedAt).toLocaleDateString('ko-KR')}
          </Text>
        </View>
      ) : (
        <View>
          <Text style={styles.aiSummaryText}>
            {reading.summary || '터치하여 상세 풀이 보기'}
          </Text>
          <Text style={styles.aiExpandHint}>터치하여 전체 보기</Text>
        </View>
      )}
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════
// 설정 메뉴 리스트
// ═══════════════════════════════════════════════════
function SettingsMenu({
  onRescan,
  onReset,
  onLogout,
}: {
  onRescan: () => void;
  onReset: () => void;
  onLogout: () => void;
}) {
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  return (
    <Animated.View entering={SlideInUp.delay(500).duration(500)} style={styles.card}>
      <Pressable style={styles.menuItem}>
        <View style={styles.menuLeft}>
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuText}>알림 설정</Text>
        </View>
        <Switch
          value={notificationEnabled}
          onValueChange={setNotificationEnabled}
          trackColor={{ false: '#E5E2DC', true: AppColors.purpleLight }}
          thumbColor={notificationEnabled ? AppColors.purpleMain : '#f4f3f4'}
        />
      </Pressable>

      <View style={styles.menuDivider} />

      <Pressable style={styles.menuItem} onPress={onRescan}>
        <View style={styles.menuLeft}>
          <Text style={styles.menuIcon}>🔄</Text>
          <Text style={styles.menuText}>운명 재스캔</Text>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </Pressable>

      <View style={styles.menuDivider} />

      <Pressable style={styles.menuItem} onPress={onReset}>
        <View style={styles.menuLeft}>
          <Text style={styles.menuIcon}>🗑️</Text>
          <Text style={[styles.menuText, { color: '#EF4444' }]}>데이터 초기화</Text>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </Pressable>

      <View style={styles.menuDivider} />

      <View style={styles.menuItem}>
        <View style={styles.menuLeft}>
          <Text style={styles.menuIcon}>ℹ️</Text>
          <Text style={styles.menuText}>앱 정보</Text>
        </View>
        <Text style={styles.menuVersion}>v1.0.0</Text>
      </View>

      <View style={styles.menuDivider} />

      <Pressable style={styles.menuItem} onPress={onLogout}>
        <View style={styles.menuLeft}>
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={[styles.menuText, { color: '#EF4444' }]}>로그아웃</Text>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </Pressable>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════
// 메인 화면
// ═══════════════════════════════════════════════════
export default function SettingsScreen() {
  const router = useRouter();
  const {
    userName,
    birthDate,
    birthTime,
    gender,
    ohang,
    strongestElement,
    weakestElement,
    guardianId,
    questStartDate,
    dayIndex,
    points,
    subGuardians,
    sajuReading,
    resetStore,
  } = useAppStore();

  const handleRescan = () => {
    Alert.alert(
      '운명 재스캔',
      '처음부터 다시 시작하시겠습니까?\n모든 진행 데이터가 초기화됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '재스캔',
          style: 'destructive',
          onPress: () => {
            resetStore();
            router.replace('/(onboarding)/scan');
          },
        },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      '데이터 초기화',
      '정말로 모든 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            resetStore();
            router.replace('/(onboarding)/scan');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃하면 처음 화면으로 돌아갑니다.\n저장된 데이터는 모두 초기화됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            resetStore();
            router.replace('/(onboarding)/scan');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader userName={userName} points={points} />
        <SajuProfileCard
          birthDate={birthDate}
          birthTime={birthTime}
          gender={gender}
          ohang={ohang}
          strongestElement={strongestElement}
          weakestElement={weakestElement}
        />
        {sajuReading && <AiInterpretationCard reading={sajuReading} />}
        <ProgressCard dayIndex={dayIndex} questStartDate={questStartDate} />
        <GuardianInfoCard guardianId={guardianId} subGuardians={subGuardians} />
        <SettingsMenu onRescan={handleRescan} onReset={handleReset} onLogout={handleLogout} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════
// 스타일
// ═══════════════════════════════════════════════════
const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: { elevation: 3 },
  default: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
}) as any;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AppColors.cream },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 30 },

  // ── 프로필 헤더 ──
  profileHeader: { alignItems: 'center', marginBottom: 20 },
  avatarLarge: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: AppColors.purpleMain,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  avatarLargeText: { fontSize: 26, fontWeight: '800', color: '#fff' },
  profileName: { fontSize: 20, fontWeight: '700', color: AppColors.textDark, marginBottom: 8 },
  pointsBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: AppColors.goldBorder,
  },
  pointsIcon: { fontSize: 16, marginRight: 6 },
  pointsText: { fontSize: 15, fontWeight: '700', color: AppColors.goldAccent },

  // ── 카드 공통 ──
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    marginBottom: 16, borderWidth: 1, borderColor: AppColors.inputBorder,
    ...shadow,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: AppColors.textDark, marginBottom: 4 },
  divider: { height: 1, backgroundColor: AppColors.inputBorder, marginVertical: 12 },

  // ── 사주 프로필 ──
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 6,
  },
  infoLabel: { fontSize: 14, color: AppColors.textMuted },
  infoValue: { fontSize: 14, fontWeight: '600', color: AppColors.textDark },
  chartWrapper: { alignItems: 'center', marginVertical: 12 },
  elementRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  elementBadge: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10,
  },
  elementBadgeEmoji: { fontSize: 14, marginRight: 6 },
  elementBadgeText: { fontSize: 13, fontWeight: '600' },

  // ── 49일 프로그레스 ──
  progressInfo: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 12 },
  progressDDay: { fontSize: 28, fontWeight: '900', color: AppColors.purpleMain },
  progressDot: { fontSize: 16, color: AppColors.textMuted },
  progressDayText: { fontSize: 14, color: AppColors.textLight },
  progressBarBg: {
    height: 10, backgroundColor: AppColors.purpleBg, borderRadius: 5, overflow: 'hidden',
  },
  progressBarFill: { height: 10, backgroundColor: AppColors.purpleMain, borderRadius: 5 },
  progressPercent: { fontSize: 12, color: AppColors.textMuted, textAlign: 'right', marginTop: 4 },
  startDate: { fontSize: 12, color: AppColors.textMuted, marginTop: 8 },

  // ── 조력자 ──
  guardianRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  guardianAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: AppColors.purpleBg,
    justifyContent: 'center', alignItems: 'center',
  },
  guardianEmoji: { fontSize: 28 },
  guardianInfo: { flex: 1 },
  guardianName: { fontSize: 18, fontWeight: '700', color: AppColors.textDark },
  guardianTitle: { fontSize: 13, color: AppColors.textMuted, marginTop: 2 },
  noGuardian: { fontSize: 14, color: AppColors.textMuted, textAlign: 'center', paddingVertical: 12 },

  // ── 보조 조력자 ──
  subGuardianLabel: { fontSize: 13, color: AppColors.textMuted, marginBottom: 8 },
  subGuardianRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
  subGuardianEmoji: { fontSize: 20 },
  subGuardianName: { fontSize: 14, fontWeight: '600', color: AppColors.textDark },
  buffBadge: {
    backgroundColor: AppColors.purpleBg,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 'auto',
  },
  buffText: { fontSize: 11, fontWeight: '600', color: AppColors.purpleMain },

  // ── 설정 메뉴 ──
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 14,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: { fontSize: 18 },
  menuText: { fontSize: 15, fontWeight: '500', color: AppColors.textDark },
  menuArrow: { fontSize: 22, color: AppColors.textMuted, fontWeight: '300' },
  menuVersion: { fontSize: 13, color: AppColors.textMuted },
  menuDivider: { height: 1, backgroundColor: AppColors.inputBorder },

  // ── AI 풀이 카드 ──
  aiCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiToggle: { fontSize: 22, color: AppColors.textMuted, fontWeight: '300' },
  aiSectionItem: { marginBottom: 14 },
  aiSectionTitle: {
    fontSize: 14, fontWeight: '700', color: AppColors.textDark, marginBottom: 4,
  },
  aiSectionContent: {
    fontSize: 13, color: AppColors.textLight, lineHeight: 20,
  },
  aiSummaryText: {
    fontSize: 14, color: AppColors.purpleMain, fontWeight: '600',
  },
  aiExpandHint: {
    fontSize: 12, color: AppColors.textMuted, marginTop: 4,
  },
  aiGeneratedAt: {
    fontSize: 11, color: AppColors.textMuted, textAlign: 'right', marginTop: 4,
  },
});
