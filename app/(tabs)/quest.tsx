/**
 * 퀘스트 탭 — 일일 미션 + 길/흉 게이지 + 특별 미션(사진 인증)
 */
import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  SlideInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store';
import { AppColors } from '../../src/styles/tokens';
import type { Quest } from '../../src/types';

const { width: SCREEN_W } = Dimensions.get('window');

// ── 장식 크리스탈 데이터 ──
const CRYSTALS = [
  { x: 15, y: 60, size: 14, color: '#A8B4E8', rotation: -20 },
  { x: SCREEN_W - 40, y: 80, size: 12, color: '#C8B8E8', rotation: 25 },
  { x: 30, y: SCREEN_W * 0.6, size: 10, color: '#7B9EE8', rotation: 40 },
  { x: SCREEN_W - 55, y: SCREEN_W * 0.5, size: 16, color: '#A8B4E8', rotation: -30 },
  { x: 20, y: SCREEN_W + 80, size: 12, color: '#C8B8E8', rotation: 15 },
  { x: SCREEN_W - 35, y: SCREEN_W + 120, size: 10, color: '#7B9EE8', rotation: -10 },
];

// ── 공통 그림자 ──
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

const goldShadow = Platform.select({
  ios: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  android: { elevation: 5 },
  default: { boxShadow: '0 3px 12px rgba(212,175,55,0.25)' },
}) as any;

// ═══════════════════════════════════════════════════
// 헤더 — 일차 + 타이틀
// ═══════════════════════════════════════════════════
function QuestHeader({ dayIndex }: { dayIndex: number }) {
  const dayNumber = dayIndex + 1;

  return (
    <Animated.View entering={FadeIn.delay(100).duration(500)} style={headerStyles.container}>
      <Text style={headerStyles.dayLabel}>49일 중 {dayNumber}일차:</Text>
      <View style={headerStyles.titleRow}>
        <Text style={headerStyles.title}>운명 방어전</Text>
        <Text style={headerStyles.titleIcon}> ⚔️</Text>
      </View>
    </Animated.View>
  );
}

const headerStyles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 20, paddingBottom: 8 },
  dayLabel: { fontSize: 15, color: AppColors.textLight, fontWeight: '500' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  title: { fontSize: 28, fontWeight: '900', color: AppColors.purpleMain, letterSpacing: 1 },
  titleIcon: { fontSize: 26 },
});

// ═══════════════════════════════════════════════════
// 길/흉 게이지
// ═══════════════════════════════════════════════════
function FortuneGauge({ value }: { value: number }) {
  // value: 0(흉) ~ 100(길), 50이 중립
  const gaugeWidth = SCREEN_W - 48;
  const markerPos = (value / 100) * gaugeWidth;

  return (
    <Animated.View entering={FadeIn.delay(200).duration(600)} style={gaugeStyles.container}>
      {/* 게이지 바 */}
      <View style={[gaugeStyles.track, { width: gaugeWidth }]}>
        <LinearGradient
          colors={['#22C55E', '#86EFAC', '#FDE68A', '#FBBF24', '#F87171', '#EF4444']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={gaugeStyles.gradient}
        />
        {/* 중앙 기준선 */}
        <View style={[gaugeStyles.centerLine, { left: gaugeWidth / 2 - 1 }]} />
        {/* 마커 */}
        <View style={[gaugeStyles.marker, { left: markerPos - 10 }]}>
          <View style={gaugeStyles.markerInner} />
        </View>
      </View>

      {/* 라벨 */}
      <View style={[gaugeStyles.labelRow, { width: gaugeWidth }]}>
        <Text style={[gaugeStyles.label, { color: '#22C55E' }]}>길</Text>
        <Text style={[gaugeStyles.label, { color: '#EF4444' }]}>흉</Text>
      </View>
    </Animated.View>
  );
}

const gaugeStyles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 8, marginBottom: 20, paddingHorizontal: 24 },
  track: {
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  gradient: { flex: 1 },
  centerLine: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: '100%',
    backgroundColor: '#1F2937',
  },
  marker: {
    position: 'absolute',
    top: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 2.5,
    borderColor: AppColors.purpleMain,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 4 },
      default: { boxShadow: '0 2px 6px rgba(0,0,0,0.2)' },
    }),
  },
  markerInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.purpleMain,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  label: { fontSize: 14, fontWeight: '700' },
});

// ═══════════════════════════════════════════════════
// 기본 미션 카드
// ═══════════════════════════════════════════════════
function BasicMissionCard({
  quest,
  onToggle,
}: {
  quest: Quest;
  onToggle: (id: string) => void;
}) {
  return (
    <Pressable
      style={[missionStyles.card, quest.completed && missionStyles.cardCompleted]}
      onPress={() => !quest.completed && onToggle(quest.id)}
    >
      <View style={missionStyles.row}>
        <View style={missionStyles.checkWrap}>
          {quest.completed ? (
            <View style={missionStyles.checkedCircle}>
              <Ionicons name="checkmark" size={14} color="#FFF" />
            </View>
          ) : (
            <View style={missionStyles.uncheckedCircle} />
          )}
        </View>

        <Text
          style={[
            missionStyles.title,
            quest.completed && missionStyles.titleCompleted,
          ]}
        >
          {quest.title}
        </Text>

        <View style={missionStyles.pointBadge}>
          <Text style={missionStyles.pointText}>{quest.point}P</Text>
        </View>
      </View>
    </Pressable>
  );
}

const missionStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 12,
    ...shadow,
  },
  cardCompleted: { opacity: 0.6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkWrap: { marginRight: 14 },
  uncheckedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  checkedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AppColors.purpleMain,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textDark,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: AppColors.textMuted,
  },
  pointBadge: {
    backgroundColor: AppColors.purpleBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  pointText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.purpleMain,
  },
});

// ═══════════════════════════════════════════════════
// 특별 미션 카드 (사진 인증)
// ═══════════════════════════════════════════════════
function SpecialMissionCard({
  quest,
  onVerify,
}: {
  quest: Quest;
  onVerify: (id: string) => void;
}) {
  // 파일 input ref (웹에서 사진 선택)
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePress = () => {
    if (quest.completed) return;

    if (Platform.OS === 'web') {
      // 웹: 파일 input 트리거
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else {
      // 네이티브: 추후 ImagePicker 구현
      onVerify(quest.id);
    }
  };

  const handleFileChange = (e: any) => {
    const file = e.target?.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      // 사진 저장 후 완료 처리
      useAppStore.getState().setQuestPhoto(quest.id, url);
      onVerify(quest.id);
    }
  };

  return (
    <View style={specialStyles.wrapper}>
      {/* 골드 프레임 */}
      <LinearGradient
        colors={['#F5E6B8', '#E8D5A0', '#D4C088']}
        style={specialStyles.outerFrame}
      >
        <View style={specialStyles.innerFrame}>
          {/* 헤더 라벨 */}
          <LinearGradient
            colors={['#D4AF37', '#C9A434', '#B8932E']}
            style={specialStyles.labelBadge}
          >
            <Text style={specialStyles.labelText}>특별 미션</Text>
          </LinearGradient>

          {/* 미션 내용 */}
          <View style={specialStyles.content}>
            <View style={specialStyles.iconCircle}>
              <Ionicons
                name={quest.completed ? 'checkmark-circle' : 'camera-outline'}
                size={28}
                color={quest.completed ? '#22C55E' : AppColors.purpleMain}
              />
            </View>

            <View style={specialStyles.textArea}>
              <Text style={specialStyles.title}>{quest.title}</Text>
            </View>

            <View style={specialStyles.specialPointBadge}>
              <Text style={specialStyles.specialPointText}>{quest.point}P</Text>
            </View>
          </View>

          {/* 인증 사진 미리보기 */}
          {quest.photoUri && (
            <View style={specialStyles.photoPreview}>
              <Image source={{ uri: quest.photoUri }} style={specialStyles.photoImage} />
            </View>
          )}

          {/* 인증 버튼 */}
          <Pressable
            style={[
              specialStyles.verifyBtn,
              quest.completed && specialStyles.verifyBtnDone,
            ]}
            onPress={handlePress}
            disabled={quest.completed}
          >
            <Ionicons
              name={quest.completed ? 'checkmark-circle' : 'camera'}
              size={16}
              color={quest.completed ? '#22C55E' : AppColors.textDark}
            />
            <Text
              style={[
                specialStyles.verifyBtnText,
                quest.completed && specialStyles.verifyBtnTextDone,
              ]}
            >
              {quest.completed ? '인증 완료' : '인증'}
            </Text>
          </Pressable>

          {/* 웹 전용: 숨겨진 파일 input */}
          {Platform.OS === 'web' && (
            <input
              ref={fileInputRef as any}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' } as any}
              onChange={handleFileChange}
            />
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const specialStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    ...goldShadow,
  },
  outerFrame: {
    borderRadius: 18,
    padding: 3,
  },
  innerFrame: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
  },
  labelBadge: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.purpleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textArea: { flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textDark,
    lineHeight: 22,
  },
  specialPointBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginLeft: 8,
  },
  specialPointText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400E',
  },
  photoPreview: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover' as any,
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  verifyBtnDone: {
    backgroundColor: '#ECFDF5',
    borderColor: '#86EFAC',
  },
  verifyBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textDark,
  },
  verifyBtnTextDone: {
    color: '#22C55E',
  },
});

// ═══════════════════════════════════════════════════
// 미션 완료 CTA 버튼
// ═══════════════════════════════════════════════════
function CompleteCTAButton({
  allCompleted,
  onPress,
}: {
  allCompleted: boolean;
  onPress: () => void;
}) {
  const btnScale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  return (
    <Animated.View entering={FadeIn.delay(600).duration(500)} style={ctaStyles.wrapper}>
      <Animated.View style={animStyle}>
        <Pressable
          style={[ctaStyles.btn, !allCompleted && ctaStyles.btnDisabled]}
          disabled={!allCompleted}
          onPress={onPress}
          onPressIn={() => { if (allCompleted) btnScale.value = withSpring(0.96); }}
          onPressOut={() => { btnScale.value = withSpring(1); }}
        >
          <Text style={[ctaStyles.btnText, !allCompleted && ctaStyles.btnTextDisabled]}>
            미션 완료하고 전리품 받기
          </Text>
        </Pressable>
      </Animated.View>
      {!allCompleted && (
        <Text style={ctaStyles.hint}>모든 미션을 완료하면 활성화됩니다.</Text>
      )}
    </Animated.View>
  );
}

const ctaStyles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginTop: 8, marginBottom: 30 },
  btn: {
    width: SCREEN_W - 48,
    height: 58,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.goldAccent,
    borderWidth: 1.5,
    borderColor: '#C9A434',
    ...goldShadow,
  },
  btnDisabled: {
    backgroundColor: '#D1D5DB',
    borderColor: '#D1D5DB',
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
      default: { boxShadow: 'none' },
    }),
  },
  btnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  btnTextDisabled: { color: '#9CA3AF' },
  hint: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 10,
  },
});

// ═══════════════════════════════════════════════════
// 메인 화면
// ═══════════════════════════════════════════════════
export default function QuestScreen() {
  const dayIndex = useAppStore((s) => s.dayIndex);
  const fortuneGauge = useAppStore((s) => s.fortuneGauge);
  const todayQuests = useAppStore((s) => s.todayQuests);
  const completeQuest = useAppStore((s) => s.completeQuest);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const basicQuests = todayQuests.filter((q) => !q.isSpecial);
  const specialQuests = todayQuests.filter((q) => q.isSpecial);
  const allCompleted = todayQuests.length > 0 && todayQuests.every((q) => q.completed);

  const handleToggle = (questId: string) => {
    completeQuest(questId);
  };

  const handleSpecialVerify = (questId: string) => {
    completeQuest(questId);
  };

  const handleClaimReward = () => {
    if (rewardClaimed) return;
    setRewardClaimed(true);
    useAppStore.getState().addPoints(20);
    useAppStore.getState().adjustFortuneGauge(5);

    if (Platform.OS === 'web') {
      window.alert('전리품을 획득했습니다! (+20P)');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 헤더 */}
          <QuestHeader dayIndex={dayIndex} />

          {/* 길/흉 게이지 */}
          <FortuneGauge value={fortuneGauge} />

          {/* 기본 미션 섹션 */}
          <Animated.View entering={SlideInUp.delay(300).duration(500)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitle}>기본 미션</Text>
              <View style={styles.sectionLine} />
            </View>

            {basicQuests.map((quest) => (
              <BasicMissionCard
                key={quest.id}
                quest={quest}
                onToggle={handleToggle}
              />
            ))}

            {basicQuests.length === 0 && (
              <Text style={styles.emptyText}>오늘의 미션이 없습니다</Text>
            )}
          </Animated.View>

          {/* 특별 미션 섹션 */}
          {specialQuests.length > 0 && (
            <Animated.View entering={SlideInUp.delay(450).duration(500)} style={styles.section}>
              {specialQuests.map((quest) => (
                <SpecialMissionCard
                  key={quest.id}
                  quest={quest}
                  onVerify={handleSpecialVerify}
                />
              ))}
            </Animated.View>
          )}

          {/* CTA 버튼 */}
          <CompleteCTAButton
            allCompleted={allCompleted && !rewardClaimed}
            onPress={handleClaimReward}
          />
        </ScrollView>
      </SafeAreaView>

      {/* 장식 크리스탈 */}
      {CRYSTALS.map((c, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: c.x,
            top: c.y,
            width: c.size * 0.6,
            height: c.size,
            backgroundColor: c.color,
            borderRadius: 3,
            opacity: 0.5,
            transform: [{ rotate: `${c.rotation}deg` }],
          }}
        />
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════
// 스타일
// ═══════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.cream },
  safe: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  section: { paddingHorizontal: 24, marginBottom: 8 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    gap: 12,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.inputBorder,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textLight,
    letterSpacing: 1,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: AppColors.textMuted,
    paddingVertical: 20,
  },
});
