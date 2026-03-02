/**
 * 주간 AI 운세 리포트 — 채팅 버블 컴포넌트
 * 프리미엄: 전체 리포트 (접기/펼치기 섹션)
 * 무료: 티저 + 프리미엄 유도
 */
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import type { WeeklyReport, OhangKey } from '../types';
import type { GuardianData } from '../data/guardians';
import { AppColors, Colors } from '../styles/tokens';

const { width: SCREEN_W } = Dimensions.get('window');

const OHANG_COLORS: Record<OhangKey, string> = {
  '목': '#22C55E',
  '화': '#EF4444',
  '토': '#EAB308',
  '금': '#F59E0B',
  '수': '#3B82F6',
};

interface Props {
  report: WeeklyReport;
  guardianEmoji: string;
  theme: GuardianData['theme'];
  isPremium: boolean;
  onUpgrade?: () => void;
}

// ── 접기/펼치기 섹션 ──
function CollapsibleSection({ section, index }: {
  section: { title: string; icon: string; content: string };
  index: number;
}) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <Pressable onPress={() => setExpanded(!expanded)} style={sectionStyles.container}>
      <View style={sectionStyles.header}>
        <Text style={sectionStyles.icon}>{section.icon}</Text>
        <Text style={sectionStyles.title}>{section.title}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={AppColors.textLight}
        />
      </View>
      {expanded && (
        <Animated.View entering={FadeIn.duration(200)}>
          <Text style={sectionStyles.content}>{section.content}</Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: { fontSize: 14 },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textDark,
  },
  content: {
    fontSize: 14,
    lineHeight: 21,
    color: AppColors.textLight,
    marginTop: 8,
    paddingLeft: 20,
  },
});

// ── 프리미엄 전체 리포트 ──
function FullReport({ report, guardianEmoji, theme }: Omit<Props, 'isPremium' | 'onUpgrade'>) {
  const luckyColor = OHANG_COLORS[report.luckyElement] ?? '#6B21A8';

  return (
    <Animated.View entering={SlideInUp.duration(400)} style={styles.guardianRow}>
      {/* 아바타 */}
      <View style={[styles.avatar, { backgroundColor: theme.bgGradientStart }]}>
        <Text style={styles.avatarEmoji}>{guardianEmoji}</Text>
      </View>

      <View style={styles.bubbleCol}>
        {/* 뱃지 */}
        <View style={[styles.badge, { backgroundColor: theme.primary + '18' }]}>
          <Text style={styles.badgeIcon}>{'\uD83D\uDD2E'}</Text>
          <Text style={[styles.badgeText, { color: theme.primary }]}>
            주간 운세 리포트
          </Text>
        </View>

        {/* 카드 */}
        <View style={[styles.card, { borderColor: theme.primary + '40' }]}>
          {/* 인사말 */}
          <Text style={styles.greeting}>{report.greeting}</Text>

          {/* 요약 */}
          <Text style={styles.overview}>{report.overview}</Text>

          {/* 섹션들 */}
          <View style={styles.sectionsWrap}>
            {report.sections.map((section, i) => (
              <CollapsibleSection key={i} section={section} index={i} />
            ))}
          </View>

          {/* 행운 정보 */}
          <View style={styles.luckyWrap}>
            <View style={styles.luckyItem}>
              <Text style={styles.luckyLabel}>{'\uD83C\uDF40'} 행운의 날</Text>
              <Text style={[styles.luckyValue, { color: theme.primary }]}>
                {report.luckyDay}
              </Text>
            </View>
            <View style={styles.luckyDivider} />
            <View style={styles.luckyItem}>
              <Text style={styles.luckyLabel}>{'\uD83D\uDC8E'} 행운의 오행</Text>
              <Text style={[styles.luckyValue, { color: luckyColor }]}>
                {report.luckyElement}({OHANG_HANJA[report.luckyElement] ?? ''})
              </Text>
            </View>
          </View>

          {/* 긍정 확언 */}
          {report.weeklyAffirmation ? (
            <View style={styles.affirmationWrap}>
              <Text style={styles.affirmationQuote}>"</Text>
              <Text style={styles.affirmationText}>{report.weeklyAffirmation}</Text>
              <Text style={styles.affirmationQuote}>"</Text>
            </View>
          ) : null}
        </View>

        {/* 타임스탬프 */}
        <Text style={styles.timestamp}>
          {formatReportTime(report.generatedAt)}
        </Text>
      </View>
    </Animated.View>
  );
}

// ── 무료 사용자 티저 ──
function TeaserReport({ report, guardianEmoji, theme, onUpgrade }: Props) {
  const teaserOverview = report.overview.split(/[.。!]/)[0] + '...';

  return (
    <Animated.View entering={SlideInUp.duration(400)} style={styles.guardianRow}>
      <View style={[styles.avatar, { backgroundColor: theme.bgGradientStart }]}>
        <Text style={styles.avatarEmoji}>{guardianEmoji}</Text>
      </View>

      <View style={styles.bubbleCol}>
        <View style={[styles.badge, { backgroundColor: 'rgba(107,33,168,0.1)' }]}>
          <Text style={styles.badgeIcon}>{'\uD83D\uDD2E'}</Text>
          <Text style={[styles.badgeText, { color: AppColors.purpleMain }]}>
            주간 운세 미리보기
          </Text>
        </View>

        <View style={[styles.card, { borderColor: AppColors.purpleLight }]}>
          <Text style={styles.greeting}>{report.greeting}</Text>
          <Text style={[styles.overview, { color: AppColors.textMuted }]}>
            {teaserOverview}
          </Text>

          {/* 블러 영역 */}
          <View style={styles.blurOverlay}>
            <Ionicons name="lock-closed" size={20} color={AppColors.purpleMain} />
            <Text style={styles.blurText}>전체 리포트는 프리미엄 전용</Text>
          </View>

          <Pressable
            onPress={onUpgrade}
            style={styles.upgradeBtn}
          >
            <LinearGradient
              colors={[AppColors.purpleMain, AppColors.purpleDark]}
              style={styles.upgradeBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.upgradeBtnText}>프리미엄 패스 시작하기</Text>
              <Text style={styles.upgradeBtnPrice}>월 5,900원</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <Text style={styles.timestamp}>
          {formatReportTime(report.generatedAt)}
        </Text>
      </View>
    </Animated.View>
  );
}

// ── 헬퍼 ──
const OHANG_HANJA: Record<string, string> = {
  '목': '木',
  '화': '火',
  '토': '土',
  '금': '金',
  '수': '水',
};

function formatReportTime(isoStr: string): string {
  try {
    const date = new Date(isoStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours < 12 ? '오전' : '오후';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${month}/${day} ${period} ${displayHour}:${minutes}`;
  } catch {
    return '';
  }
}

// ── 메인 export ──
export default function WeeklyReportBubble(props: Props) {
  if (props.isPremium) {
    return <FullReport {...props} />;
  }
  return <TeaserReport {...props} />;
}

// ── 스타일 ──
const styles = StyleSheet.create({
  guardianRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    maxWidth: SCREEN_W * 0.88,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  avatarEmoji: { fontSize: 16 },
  bubbleCol: { flex: 1 },

  // 뱃지
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
    gap: 4,
  },
  badgeIcon: { fontSize: 12 },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // 카드
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    padding: 14,
  },
  greeting: {
    fontSize: 15,
    lineHeight: 22,
    color: AppColors.textDark,
    fontWeight: '600',
    marginBottom: 8,
  },
  overview: {
    fontSize: 14,
    lineHeight: 21,
    color: AppColors.textLight,
    marginBottom: 12,
  },

  // 섹션 영역
  sectionsWrap: {
    marginBottom: 12,
  },

  // 행운 정보
  luckyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  luckyItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  luckyLabel: {
    fontSize: 12,
    color: AppColors.textMuted,
  },
  luckyValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  luckyDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginHorizontal: 8,
  },

  // 긍정 확언
  affirmationWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(107,33,168,0.06)',
    borderRadius: 10,
    padding: 12,
  },
  affirmationQuote: {
    fontSize: 20,
    color: AppColors.purpleMain,
    fontWeight: '700',
    lineHeight: 24,
  },
  affirmationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: AppColors.textDark,
    fontStyle: 'italic',
    paddingHorizontal: 4,
  },

  // 타임스탬프
  timestamp: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 4,
    marginLeft: 4,
  },

  // 티저 블러
  blurOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(107,33,168,0.06)',
    borderRadius: 10,
    paddingVertical: 16,
    marginBottom: 12,
    gap: 8,
  },
  blurText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.purpleMain,
  },

  // 업그레이드 버튼
  upgradeBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  upgradeBtnGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderRadius: 12,
  },
  upgradeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  upgradeBtnPrice: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});
