/**
 * 심층 해설 운세 모달
 * 마크다운 형식의 3단 구조 운세 해설을 바텀시트 스타일로 표시
 */
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius } from '../styles/tokens';

const { height: SCREEN_H } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  deepFortune: string | null;
  loading: boolean;
  guardianName: string;
  themeColor: string;
}

/** 간이 마크다운 → 컴포넌트 변환 (h3, 본문) */
function renderMarkdown(text: string, themeColor: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // ### 헤더
    if (trimmed.startsWith('### ')) {
      elements.push(
        <Text key={key++} style={[styles.sectionTitle, { color: themeColor }]}>
          {trimmed.replace('### ', '')}
        </Text>
      );
    } else {
      elements.push(
        <Text key={key++} style={styles.paragraph}>
          {trimmed}
        </Text>
      );
    }
  }

  return elements;
}

export default function DeepFortuneModal({
  visible,
  onClose,
  deepFortune,
  loading,
  guardianName,
  themeColor,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* 딤 배경 */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View entering={FadeIn.duration(200)} style={styles.backdropInner} />
      </Pressable>

      {/* 바텀시트 */}
      <Animated.View entering={SlideInDown.duration(300).springify()} style={styles.sheet}>
        {/* 핸들 바 */}
        <View style={styles.handleBar} />

        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: themeColor }]}>
            🔮 심층 운세 해설
          </Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close-circle" size={28} color={Colors.textMuted} />
          </Pressable>
        </View>

        <Text style={styles.headerSub}>
          {guardianName}이(가) 전하는 오늘의 명리학적 해설
        </Text>

        {/* 콘텐츠 */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={themeColor} />
              <Text style={styles.loadingText}>
                {guardianName}이(가) 기운을 분석하고 있습니다...
              </Text>
            </View>
          ) : deepFortune ? (
            renderMarkdown(deepFortune, themeColor)
          ) : (
            <Text style={styles.emptyText}>
              아직 오늘의 운세가 생성되지 않았습니다.{'\n'}
              채팅에서 "오늘의 운세" 버튼을 먼저 눌러주세요.
            </Text>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_H * 0.8,
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  contentContainer: {
    paddingBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text,
    marginBottom: 6,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 60,
    lineHeight: 22,
  },
});
