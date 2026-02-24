/**
 * 수호신 교감 채팅 화면
 * - 레퍼런스 UI 기반 신비로운 다크 테마
 * - 친밀도 시스템 + BM 연동
 * - 무료: 총 3회 체험 → 프리미엄 구독 유도
 * - 프리미엄: 무제한 채팅
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useAppStore } from '../../src/store';
import { getGuardianById, type GuardianData } from '../../src/data/guardians';
import { getIntimacyLevel } from '../../src/services/purchase';
import { AppColors } from '../../src/styles/tokens';
import type { ChatMessage, QuickAction } from '../../src/types';

const { width: SCREEN_W } = Dimensions.get('window');
const FREE_CHAT_LIMIT = 3;

// ── 수호신 이모지 매핑 ──
const GUARDIAN_EMOJI: Record<string, string> = {
  cheongmyeong: '\uD83D\uDC09',
  yeomhwa: '\uD83D\uDC15',
  taepung: '\uD83D\uDC2F',
  musoe: '\uD83D\uDC22',
  hwangto: '\uD83D\uDC3B',
};

// ── 수호신별 다크 그라데이션 ──
const CHAT_BG_GRADIENTS: Record<string, [string, string, string]> = {
  cheongmyeong: ['#061520', '#0C2A40', '#123D5C'],
  yeomhwa: ['#1A0808', '#2D1010', '#401818'],
  taepung: ['#081A0C', '#102D18', '#184024'],
  musoe: ['#121214', '#1E1E22', '#2A2A30'],
  hwangto: ['#1A1408', '#2D2210', '#403018'],
};

const DEFAULT_BG: [string, string, string] = ['#0F0F1A', '#1A1A2E', '#252540'];

// ── 수호신 속성 짧은 표시명 ──
const GUARDIAN_SUBTITLE: Record<string, string> = {
  cheongmyeong: '물의 수호신',
  yeomhwa: '불의 수호신',
  taepung: '나무의 수호신',
  musoe: '쇠의 수호신',
  hwangto: '흙의 수호신',
};

// ── 빠른 액션 칩 ──
const QUICK_ACTIONS: QuickAction[] = [
  { id: 'omen', emoji: '\uD83D\uDD2E', label: '징조 묻기', action: 'ask_omen' },
  { id: 'quest', emoji: '\uD83D\uDD04', label: '퀘스트 변경', action: 'change_quest' },
  { id: 'comfort', emoji: '\u2615', label: '위로받기', action: 'get_comfort', intimacyBonus: 2 },
];

const QUICK_ACTION_MESSAGES: Record<string, string> = {
  ask_omen: '오늘의 징조를 알려주세요',
  change_quest: '다른 퀘스트를 추천해주세요',
  get_comfort: '오늘 힘든 일이 있었어요, 위로해주세요',
};

// ── 반짝이 위치 데이터 ──
const SPARKLES = [
  { x: '12%', y: 60, size: 3, delay: 0 },
  { x: '88%', y: 120, size: 4, delay: 300 },
  { x: '25%', y: 250, size: 2, delay: 600 },
  { x: '72%', y: 180, size: 5, delay: 200 },
  { x: '50%', y: 350, size: 3, delay: 800 },
  { x: '92%', y: 300, size: 2, delay: 500 },
  { x: '8%', y: 420, size: 4, delay: 400 },
  { x: '65%', y: 80, size: 3, delay: 700 },
  { x: '35%', y: 500, size: 2, delay: 100 },
  { x: '78%', y: 450, size: 3, delay: 900 },
];

// ── 타임스탬프 포맷 ──
function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours < 12 ? '오전' : '오후';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${period} ${displayHour}:${minutes}`;
}

// ── 임시 응답 (AI 연동 전) ──
function getPlaceholderResponse(name: string, action?: string): string {
  if (action === 'ask_omen') {
    const omens = [
      `오늘 오후 3시경, 북서쪽에서 예기치 못한 금(金)의 흉살이 다가오는 것이 느껴집니다. 각별히 몸을 사리셔야 합니다.`,
      `동쪽에서 나무(木)의 기운이 강하게 불어옵니다. 새로운 시작에 좋은 징조예요.`,
      `오늘은 물(水)의 기운이 안정적입니다. 마음을 편히 가지시면 좋은 일이 생길 거예요.`,
    ];
    return omens[Math.floor(Math.random() * omens.length)];
  }
  if (action === 'change_quest') {
    return `미리 물의 기운을 보충해 두는 것이 좋겠습니다. 지금 당장 얼음물을 한 잔 드시고 인증해 주시겠습니까?`;
  }
  if (action === 'get_comfort') {
    const comforts = [
      `힘든 하루를 보내고 계시는군요. ${name}이(가) 항상 곁에서 지켜보고 있다는 걸 잊지 마세요. 오늘은 따뜻한 차 한 잔과 함께 쉬어가세요.`,
      `당신의 오행 기운이 조금 흐트러져 있네요. 깊은 숨을 세 번 쉬고, 마음을 가다듬어 보세요. ${name}이(가) 기운을 보내드리겠습니다.`,
    ];
    return comforts[Math.floor(Math.random() * comforts.length)];
  }
  const responses = [
    `좋은 질문이네요. ${name}이(가) 느끼기에 오늘은 긍정적인 기운이 흐르고 있어요. 마음을 열고 하루를 보내보세요.`,
    `흠, 조금 신중할 필요가 있어 보이네요. 오늘은 큰 결정보다는 작은 실천에 집중해보는 건 어떨까요?`,
    `당신의 오행 균형을 보니 지금은 쉬어가는 시간도 필요해 보여요. 자신을 돌보는 것도 용기랍니다.`,
    `재미있는 고민이네요! 운세적으로 보면 이번 주 후반에 좋은 기회가 올 수 있어요. 준비해두세요.`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// ══════════════════════════════════════════════
// ── 서브 컴포넌트 ──
// ══════════════════════════════════════════════

// ── 반짝이 하나 ──
function Sparkle({ x, y, size, delay: d, color }: {
  x: string; y: number; size: number; delay: number; color: string;
}) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x as any,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

// ── 타이핑 인디케이터 ──
function TypingIndicator({ guardianName, color }: { guardianName: string; color: string }) {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const anim = (sv: typeof dot1, delay: number) => {
      sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.3, { duration: 400 }),
          ),
          -1,
        ),
      );
    };
    anim(dot1, 0);
    anim(dot2, 200);
    anim(dot3, 400);
  }, []);

  const s1 = useAnimatedStyle(() => ({ opacity: dot1.value, transform: [{ scale: 0.8 + dot1.value * 0.4 }] }));
  const s2 = useAnimatedStyle(() => ({ opacity: dot2.value, transform: [{ scale: 0.8 + dot2.value * 0.4 }] }));
  const s3 = useAnimatedStyle(() => ({ opacity: dot3.value, transform: [{ scale: 0.8 + dot3.value * 0.4 }] }));

  return (
    <View style={styles.typingWrap}>
      <View style={styles.typingDots}>
        <Animated.View style={[styles.typingDot, { backgroundColor: color }, s1]} />
        <Animated.View style={[styles.typingDot, { backgroundColor: color }, s2]} />
        <Animated.View style={[styles.typingDot, { backgroundColor: color }, s3]} />
      </View>
      <Text style={styles.typingText}>{guardianName}이(가) 답변 중...</Text>
    </View>
  );
}

// ── 수호신 말풍선 ──
function GuardianBubble({
  message,
  guardianEmoji,
  theme,
  onQuestAccept,
}: {
  message: ChatMessage;
  guardianEmoji: string;
  theme: GuardianData['theme'];
  onQuestAccept?: (questId: string) => void;
}) {
  return (
    <Animated.View entering={SlideInUp.duration(300)} style={styles.guardianRow}>
      {/* 아바타 */}
      <View style={[styles.avatar, { backgroundColor: theme.bgGradientStart }]}>
        <Text style={styles.avatarEmoji}>{guardianEmoji}</Text>
      </View>

      <View style={styles.guardianBubbleCol}>
        {/* 말풍선 */}
        <View style={[styles.guardianBubble, { borderColor: theme.primary + '60' }]}>
          <Text style={styles.guardianText}>{message.content}</Text>

          {/* 퀘스트 수락 버튼 */}
          {message.questAction && !message.questAction.accepted && (
            <Animated.View entering={FadeIn.delay(200).duration(400)}>
              <Pressable
                onPress={() => onQuestAccept?.(message.questAction!.questId)}
                style={styles.questBtnWrap}
              >
                <LinearGradient
                  colors={['#D4AF37', '#C9A434', '#B8932E']}
                  style={styles.questBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.questBtnText}>퀘스트 수락하기</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          )}
          {message.questAction?.accepted && (
            <View style={styles.questAccepted}>
              <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
              <Text style={styles.questAcceptedText}>수락 완료</Text>
            </View>
          )}
        </View>

        {/* 타임스탬프 */}
        <Text style={styles.timestamp}>{formatTimestamp(message.timestamp)}</Text>
      </View>
    </Animated.View>
  );
}

// ── 사용자 말풍선 ──
function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <Animated.View entering={SlideInUp.duration(300)} style={styles.userRow}>
      <View style={styles.userBubbleCol}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
        <Text style={[styles.timestamp, { textAlign: 'right' }]}>
          {formatTimestamp(message.timestamp)}
        </Text>
      </View>
    </Animated.View>
  );
}

// ── 빠른 액션 칩 ──
function QuickActionChips({
  actions,
  onAction,
  disabled,
}: {
  actions: QuickAction[];
  onAction: (action: QuickAction) => void;
  disabled: boolean;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsContainer}
      style={styles.chipsScroll}
    >
      {actions.map((action) => (
        <Pressable
          key={action.id}
          onPress={() => onAction(action)}
          disabled={disabled}
          style={({ pressed }) => [
            styles.chip,
            pressed && { transform: [{ scale: 0.95 }] },
            disabled && { opacity: 0.5 },
          ]}
        >
          <Text style={styles.chipEmoji}>{action.emoji}</Text>
          <Text style={styles.chipLabel}>{action.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ── 혜택 아이템 (잠금 화면용) ──
function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitRow}>
      <Ionicons name={icon as any} size={18} color={AppColors.purpleMain} />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

// ══════════════════════════════════════════════
// ── 메인 컴포넌트 ──
// ══════════════════════════════════════════════

export default function ChatScreen() {
  const router = useRouter();
  const {
    guardianId,
    isPremium,
    chatUsedCount,
    incrementChatUsed,
    guardianIntimacy,
    incrementIntimacy,
  } = useAppStore();

  const guardian = guardianId ? getGuardianById(guardianId) : null;
  const guardianName = guardian?.name ?? '수호신';
  const guardianEmoji = guardianId ? GUARDIAN_EMOJI[guardianId] ?? '\uD83D\uDD2E' : '\uD83D\uDD2E';
  const guardianSubtitle = guardianId ? GUARDIAN_SUBTITLE[guardianId] ?? '' : '';
  const theme = guardian?.theme ?? {
    primary: AppColors.purpleMain,
    secondary: AppColors.purpleLight,
    glow: 'rgba(107,33,168,0.3)',
    cardBorder: AppColors.purpleLight,
    bgGradientStart: AppColors.purpleBg,
    bgGradientEnd: AppColors.purpleLight,
  };
  const bgGradient = guardianId ? CHAT_BG_GRADIENTS[guardianId] ?? DEFAULT_BG : DEFAULT_BG;
  const intimacyPoints = guardianId ? (guardianIntimacy[guardianId] ?? 0) : 0;
  const intimacyLevel = getIntimacyLevel(intimacyPoints);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'guardian',
      content: `안녕하세요, 저는 ${guardianName}입니다. 오늘 운세나 고민이 있으시면 편하게 말씀해주세요.`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string | undefined>(undefined);
  const flatListRef = useRef<FlatList>(null);

  const remainingFree = Math.max(0, FREE_CHAT_LIMIT - chatUsedCount);
  const isLocked = !isPremium && remainingFree <= 0;

  // ── 메시지 전송 ──
  const handleSend = useCallback((text?: string, actionType?: string, intimacyBonus?: number) => {
    const msgText = text ?? input.trim();
    if (!msgText || loading || isLocked) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: msgText,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!text) setInput('');
    setLoading(true);
    setLastAction(actionType);

    // 무료 사용자 횟수 차감
    if (!isPremium) {
      incrementChatUsed();
    }

    // 친밀도 증가: 기본 +1, 칩 보너스 추가
    if (guardianId) {
      incrementIntimacy(guardianId, 1 + (intimacyBonus ?? 0));
    }

    // TODO: 실제 AI 채팅 Cloud Function 연동
    setTimeout(() => {
      const shouldAddQuest = actionType === 'change_quest' || (actionType === 'ask_omen' && Math.random() > 0.5);
      const guardianMsg: ChatMessage = {
        id: `guardian-${Date.now()}`,
        role: 'guardian',
        content: getPlaceholderResponse(guardianName, actionType),
        timestamp: Date.now(),
        ...(shouldAddQuest && {
          questAction: {
            type: 'quest_accept' as const,
            questTitle: '얼음물 한 잔 마시기',
            questId: `quest-${Date.now()}`,
            accepted: false,
          },
        }),
      };
      setMessages((prev) => [...prev, guardianMsg]);
      setLoading(false);
      setLastAction(undefined);
    }, 1500);
  }, [input, loading, isLocked, isPremium, guardianId, guardianName]);

  // ── 빠른 액션 칩 핸들러 ──
  const handleQuickAction = useCallback((action: QuickAction) => {
    const msg = QUICK_ACTION_MESSAGES[action.action];
    if (msg) {
      handleSend(msg, action.action, action.intimacyBonus);
    }
  }, [handleSend]);

  // ── 퀘스트 수락 핸들러 ──
  const handleQuestAccept = useCallback((questId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.questAction?.questId === questId
          ? { ...m, questAction: { ...m.questAction, accepted: true } }
          : m
      ),
    );
    // 친밀도 +3
    if (guardianId) {
      incrementIntimacy(guardianId, 3);
    }
    // 수락 확인 메시지
    setTimeout(() => {
      const confirmMsg: ChatMessage = {
        id: `guardian-confirm-${Date.now()}`,
        role: 'guardian',
        content: `좋습니다! 퀘스트를 수락하셨네요. ${guardianName}이(가) 응원하고 있겠습니다. 화이팅!`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, confirmMsg]);
    }, 500);
  }, [guardianId, guardianName]);

  // 메시지 추가 시 스크롤
  useEffect(() => {
    if (messages.length > 1) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  // ── 프리미엄 유도 화면 (채팅 제한 도달) ──
  if (isLocked) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Animated.View entering={FadeIn.duration(500)} style={styles.lockedContainer}>
          <Text style={styles.lockedEmoji}>{'\uD83D\uDD12'}</Text>
          <Text style={styles.lockedTitle}>무료 체험이 끝났어요</Text>
          <Text style={styles.lockedDesc}>
            {guardianName}와의 대화를 무제한으로 이어가려면{'\n'}
            프리미엄 패스를 구독해보세요.
          </Text>

          <View style={styles.benefitList}>
            <BenefitItem icon="chatbubbles" text="AI 수호신 채팅 무제한" />
            <BenefitItem icon="star" text="퀘스트 포인트 1.5배" />
            <BenefitItem icon="document-text" text="주간 AI 운세 리포트" />
            <BenefitItem icon="heart" text="친밀도 레벨 Lv.5+ 해금" />
            <BenefitItem icon="game-controller" text="프리미엄 전용 퀘스트" />
          </View>

          <Pressable style={styles.premiumBtn}>
            <Text style={styles.premiumBtnText}>프리미엄 패스 시작하기</Text>
            <Text style={styles.premiumBtnPrice}>월 5,900원</Text>
          </Pressable>

          <Text style={styles.lockedFooter}>
            체험 {FREE_CHAT_LIMIT}회를 모두 사용했습니다
          </Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── 메인 채팅 화면 ──
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={AppColors.textDark} />
        </Pressable>

        <Text style={styles.headerName}>{guardianName}</Text>
        <Text style={styles.headerSubtitle}>{guardianSubtitle}</Text>

        <Text style={styles.headerEmoji}>{guardianEmoji}</Text>

        <View style={styles.headerSpacer} />

        {/* 친밀도 뱃지 */}
        <View style={[styles.intimacyBadge, { borderColor: theme.primary }]}>
          <Text style={[styles.intimacyHeart, { color: theme.primary }]}>{'\u2764'}</Text>
          <Text style={[styles.intimacyText, { color: theme.primary }]}>
            친밀도 Lv.{intimacyLevel}
          </Text>
        </View>
      </View>

      {/* 무료 횟수 표시 */}
      {!isPremium && (
        <View style={styles.freeCountBar}>
          <Text style={styles.freeCountText}>
            무료 체험 {remainingFree}/{FREE_CHAT_LIMIT}회 남음
          </Text>
        </View>
      )}
      {isPremium && (
        <View style={styles.freeCountBar}>
          <Text style={[styles.freeCountText, { color: AppColors.purpleMain }]}>
            {'\u2728'} 프리미엄
          </Text>
        </View>
      )}

      {/* ── 채팅 영역 ── */}
      <View style={styles.chatArea}>
        {/* 다크 그라데이션 배경 */}
        <LinearGradient
          colors={bgGradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* 반짝이 효과 */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {SPARKLES.map((s, i) => (
            <Sparkle
              key={i}
              x={s.x}
              y={s.y}
              size={s.size}
              delay={s.delay}
              color={i % 3 === 0 ? theme.secondary : '#FFFFFF'}
            />
          ))}
        </View>

        {/* 채팅 메시지 FlatList */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatList}
          renderItem={({ item }) =>
            item.role === 'guardian' ? (
              <GuardianBubble
                message={item}
                guardianEmoji={guardianEmoji}
                theme={theme}
                onQuestAccept={handleQuestAccept}
              />
            ) : (
              <UserBubble message={item} />
            )
          }
        />

        {/* 타이핑 인디케이터 */}
        {loading && <TypingIndicator guardianName={guardianName} color={theme.primary} />}
      </View>

      {/* ── 하단 (칩 + 입력창) ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.bottomArea}
      >
        {/* 빠른 액션 칩 */}
        <QuickActionChips
          actions={QUICK_ACTIONS}
          onAction={handleQuickAction}
          disabled={loading}
        />

        {/* 입력창 */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="메시지 입력..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            multiline={false}
          />
          <Pressable
            style={[
              styles.sendBtn,
              { backgroundColor: theme.primary },
              !input.trim() && styles.sendBtnDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════
// ── 스타일 ──
// ══════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },

  // ── 헤더 ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: AppColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.tabBorder,
    gap: 6,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.textDark,
  },
  headerSubtitle: {
    fontSize: 12,
    color: AppColors.textLight,
    marginRight: 2,
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerSpacer: {
    flex: 1,
  },
  intimacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  intimacyHeart: {
    fontSize: 12,
  },
  intimacyText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ── 무료 횟수 바 ──
  freeCountBar: {
    backgroundColor: AppColors.surface,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.tabBorder,
  },
  freeCountText: {
    fontSize: 11,
    color: AppColors.textMuted,
    textAlign: 'center',
  },

  // ── 채팅 영역 ──
  chatArea: {
    flex: 1,
    position: 'relative',
  },
  chatList: {
    padding: 16,
    paddingBottom: 8,
  },

  // ── 수호신 말풍선 ──
  guardianRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    maxWidth: SCREEN_W * 0.82,
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
  avatarEmoji: {
    fontSize: 16,
  },
  guardianBubbleCol: {
    flex: 1,
  },
  guardianBubble: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    padding: 12,
  },
  guardianText: {
    fontSize: 15,
    lineHeight: 22,
    color: AppColors.textDark,
  },

  // ── 퀘스트 수락 버튼 ──
  questBtnWrap: {
    marginTop: 10,
  },
  questBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  questBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  questAccepted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  questAcceptedText: {
    fontSize: 13,
    color: '#22C55E',
    fontWeight: '600',
  },

  // ── 사용자 말풍선 ──
  userRow: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userBubbleCol: {
    maxWidth: SCREEN_W * 0.75,
  },
  userBubble: {
    backgroundColor: AppColors.purpleMain,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFF',
  },

  // ── 타임스탬프 ──
  timestamp: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 4,
    marginLeft: 4,
  },

  // ── 타이핑 인디케이터 ──
  typingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
  },

  // ── 빠른 액션 칩 ──
  chipsScroll: {
    maxHeight: 48,
  },
  chipsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 6,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },

  // ── 하단 영역 ──
  bottomArea: {
    backgroundColor: 'rgba(15,15,26,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },

  // ── 프리미엄 잠금 화면 ──
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: AppColors.cream,
  },
  lockedEmoji: { fontSize: 48, marginBottom: 16 },
  lockedTitle: { fontSize: 22, fontWeight: '800', color: AppColors.textDark, marginBottom: 8 },
  lockedDesc: {
    fontSize: 15,
    color: AppColors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  benefitList: { width: '100%', gap: 12, marginBottom: 28 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8 },
  benefitText: { fontSize: 15, color: AppColors.textDark },
  premiumBtn: {
    width: '100%',
    backgroundColor: AppColors.purpleMain,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumBtnText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  premiumBtnPrice: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  lockedFooter: { fontSize: 12, color: AppColors.textMuted },
});
