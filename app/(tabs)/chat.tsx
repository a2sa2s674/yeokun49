/**
 * 조력자 AI 채팅 화면
 * - 무료: 총 3회 체험 → 이후 프리미엄 구독 유도
 * - 프리미엄: 무제한 채팅
 */
import { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { useAppStore } from '../../src/store';
import { getGuardianById } from '../../src/data/guardians';
import { AppColors } from '../../src/styles/tokens';

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

interface ChatMsg {
  id: string;
  role: 'user' | 'guardian';
  text: string;
}

export default function ChatScreen() {
  const {
    guardianId,
    isPremium,
    chatUsedCount,
    incrementChatUsed,
  } = useAppStore();

  const guardian = guardianId ? getGuardianById(guardianId) : null;
  const guardianName = guardian?.name ?? '수호신';
  const guardianEmoji = guardianId ? GUARDIAN_EMOJI[guardianId] ?? '\uD83D\uDD2E' : '\uD83D\uDD2E';

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      role: 'guardian',
      text: `안녕하세요, 저는 ${guardianName}입니다. 오늘 운세나 고민이 있으시면 편하게 말씀해주세요.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const remainingFree = Math.max(0, FREE_CHAT_LIMIT - chatUsedCount);
  const isLocked = !isPremium && remainingFree <= 0;

  const handleSend = async () => {
    if (!input.trim() || loading || isLocked) return;

    const userMsg: ChatMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // 무료 사용자 횟수 차감
    if (!isPremium) {
      incrementChatUsed();
    }

    // TODO: 실제 AI 채팅 Cloud Function 연동
    // 현재는 임시 응답
    setTimeout(() => {
      const guardianMsg: ChatMsg = {
        id: `guardian-${Date.now()}`,
        role: 'guardian',
        text: getPlaceholderResponse(guardianName),
      };
      setMessages((prev) => [...prev, guardianMsg]);
      setLoading(false);
    }, 1500);
  };

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>{guardianEmoji}</Text>
        <View>
          <Text style={styles.headerName}>{guardianName}</Text>
          {!isPremium && (
            <Text style={styles.headerRemaining}>
              무료 체험 {remainingFree}/{FREE_CHAT_LIMIT}회 남음
            </Text>
          )}
          {isPremium && (
            <Text style={styles.headerPremium}>{'\u2728'} 프리미엄</Text>
          )}
        </View>
      </View>

      {/* 채팅 목록 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        renderItem={({ item }) => (
          <Animated.View
            entering={SlideInUp.duration(300)}
            style={[
              styles.bubble,
              item.role === 'user' ? styles.userBubble : styles.guardianBubble,
            ]}
          >
            {item.role === 'guardian' && (
              <Text style={styles.bubbleEmoji}>{guardianEmoji}</Text>
            )}
            <Text
              style={[
                styles.bubbleText,
                item.role === 'user' ? styles.userText : styles.guardianText,
              ]}
            >
              {item.text}
            </Text>
          </Animated.View>
        )}
      />

      {/* 로딩 표시 */}
      {loading && (
        <View style={styles.typingWrap}>
          <Text style={styles.typingText}>{guardianName}이(가) 답변 중...</Text>
        </View>
      )}

      {/* 입력창 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder={`${guardianName}에게 물어보세요...`}
            placeholderTextColor={AppColors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline={false}
          />
          <Pressable
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── 혜택 아이템 컴포넌트 ──
function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitRow}>
      <Ionicons name={icon as any} size={18} color={AppColors.purpleMain} />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

// ── 임시 응답 (AI 연동 전) ──
function getPlaceholderResponse(name: string): string {
  const responses = [
    `좋은 질문이네요. ${name}이(가) 느끼기에 오늘은 긍정적인 기운이 흐르고 있어요. 마음을 열고 하루를 보내보세요.`,
    `흠, 조금 신중할 필요가 있어 보이네요. 오늘은 큰 결정보다는 작은 실천에 집중해보는 건 어떨까요?`,
    `당신의 오행 균형을 보니 지금은 쉬어가는 시간도 필요해 보여요. 자신을 돌보는 것도 용기랍니다.`,
    `재미있는 고민이네요! 운세적으로 보면 이번 주 후반에 좋은 기회가 올 수 있어요. 준비해두세요.`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// ── 스타일 ──
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.cream,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.tabBorder,
    backgroundColor: AppColors.surface,
    gap: 12,
  },
  headerEmoji: { fontSize: 32 },
  headerName: { fontSize: 18, fontWeight: '700', color: AppColors.textDark },
  headerRemaining: { fontSize: 12, color: AppColors.textMuted, marginTop: 2 },
  headerPremium: { fontSize: 12, color: AppColors.purpleMain, fontWeight: '600', marginTop: 2 },

  // 채팅 목록
  chatList: { padding: 16, paddingBottom: 8 },
  bubble: {
    maxWidth: SCREEN_W * 0.75,
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: AppColors.purpleMain,
    borderBottomRightRadius: 4,
  },
  guardianBubble: {
    alignSelf: 'flex-start',
    backgroundColor: AppColors.surface,
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: AppColors.inputBorder,
  },
  bubbleEmoji: { fontSize: 16, marginTop: 2 },
  bubbleText: { fontSize: 15, lineHeight: 22, flex: 1 },
  userText: { color: '#FFF' },
  guardianText: { color: AppColors.textDark },

  // 타이핑 표시
  typingWrap: { paddingHorizontal: 20, paddingBottom: 8 },
  typingText: { fontSize: 13, color: AppColors.textMuted, fontStyle: 'italic' },

  // 입력창
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.tabBorder,
    backgroundColor: AppColors.surface,
    gap: 10,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: AppColors.inputBg,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 15,
    color: AppColors.textDark,
    borderWidth: 1,
    borderColor: AppColors.inputBorder,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.purpleMain,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },

  // 프리미엄 유도 (잠금 화면)
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
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
