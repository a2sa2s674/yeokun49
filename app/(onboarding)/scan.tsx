import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const CREAM = '#F5F0E8';
const PURPLE_MAIN = '#6B21A8';
const PURPLE_LIGHT = '#C4B5D9';
const PURPLE_BG = '#E8E0F0';
const GOLD_BORDER = '#C9B87A';
const CARD_BG = 'rgba(255,255,255,0.75)';
const TEXT_DARK = '#2D2D2D';
const TEXT_MUTED = '#9CA3AF';
const INPUT_BG = '#F9F7F4';
const INPUT_BORDER = '#E5E2DC';

// 장식 구슬
const decorations = [
  { x: width - 50, y: 340, size: 22, color: '#C8B8E8' },
  { x: width - 30, y: 380, size: 16, color: '#D4CCE8' },
  { x: 15, y: 400, size: 18, color: '#C8B8E8' },
  { x: -10, y: height - 160, size: 70, color: '#E8D5A0', rotation: -15, shape: 'card' as const },
  { x: 40, y: height - 130, size: 65, color: '#E8D5A0', rotation: 5, shape: 'card' as const },
  { x: 90, y: height - 110, size: 60, color: '#E8D5A0', rotation: 20, shape: 'card' as const },
  { x: width - 90, y: height - 140, size: 65, color: '#E8D5A0', rotation: -10, shape: 'card' as const },
  { x: width - 40, y: height - 120, size: 60, color: '#E8D5A0', rotation: 15, shape: 'card' as const },
  { x: width - 70, y: height - 80, size: 50, color: '#9B7EC8', rotation: 25, shape: 'crystal' as const },
  { x: 60, y: height - 70, size: 14, color: '#7DD3C0' },
  { x: width - 120, y: height - 60, size: 16, color: '#7DD3C0' },
  { x: width - 150, y: height - 90, size: 12, color: '#4A5899' },
];

const YEARS = Array.from({ length: 100 }, (_, i) => `${2026 - i}`);
const MONTHS = Array.from({ length: 12 }, (_, i) => `${i + 1}`);
const DAYS = Array.from({ length: 31 }, (_, i) => `${i + 1}`);
const BIRTH_TIMES = [
  '모름',
  '子시 (23:00~01:00)',
  '丑시 (01:00~03:00)',
  '寅시 (03:00~05:00)',
  '卯시 (05:00~07:00)',
  '辰시 (07:00~09:00)',
  '巳시 (09:00~11:00)',
  '午시 (11:00~13:00)',
  '未시 (13:00~15:00)',
  '申시 (15:00~17:00)',
  '酉시 (17:00~19:00)',
  '戌시 (19:00~21:00)',
  '亥시 (21:00~23:00)',
];

type PickerField = 'year' | 'month' | 'day' | 'birthTime' | null;

export default function ScanScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState<'남' | '여'>('남');
  const [activePicker, setActivePicker] = useState<PickerField>(null);

  const buttonScale = useSharedValue(1);
  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleSubmit = () => {
    if (!name.trim() || !year || !month || !day) return;

    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    router.push({
      pathname: '/(onboarding)/result',
      params: {
        name: name.trim(),
        year,
        month,
        day,
        birthTime: birthTime || '모름',
        gender,
      },
    });
  };

  const getPickerData = (): string[] => {
    switch (activePicker) {
      case 'year': return YEARS;
      case 'month': return MONTHS;
      case 'day': return DAYS;
      case 'birthTime': return BIRTH_TIMES;
      default: return [];
    }
  };

  const handlePickerSelect = (value: string) => {
    switch (activePicker) {
      case 'year': setYear(value); break;
      case 'month': setMonth(value); break;
      case 'day': setDay(value); break;
      case 'birthTime': setBirthTime(value); break;
    }
    setActivePicker(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 로고 */}
        <View style={styles.logoSection}>
          <Text style={styles.moonIcon}>☽</Text>
          <Text style={styles.logoText}>역운49</Text>
          <Text style={styles.subtitle}>
            당신의 타고난 명식을{'\n'}확인합니다
          </Text>
        </View>

        {/* 폼 카드 */}
        <View style={styles.formCard}>
          {/* 이름 */}
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✧</Text>
              <TextInput
                style={styles.textInput}
                placeholder="이름"
                placeholderTextColor={TEXT_MUTED}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* 생년월일 */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.labelIcon}>📅</Text>
              <Text style={styles.label}>생년월일</Text>
            </View>
            <View style={styles.dateRow}>
              <Pressable
                style={[styles.selectBox, activePicker === 'year' && styles.selectBoxActive]}
                onPress={() => setActivePicker(activePicker === 'year' ? null : 'year')}
              >
                <Text style={year ? styles.selectText : styles.selectPlaceholder}>
                  {year || '년도'}
                </Text>
                <Text style={styles.chevron}>⌄</Text>
              </Pressable>
              <Pressable
                style={[styles.selectBox, activePicker === 'month' && styles.selectBoxActive]}
                onPress={() => setActivePicker(activePicker === 'month' ? null : 'month')}
              >
                <Text style={month ? styles.selectText : styles.selectPlaceholder}>
                  {month ? `${month}월` : '월'}
                </Text>
                <Text style={styles.chevron}>⌄</Text>
              </Pressable>
              <Pressable
                style={[styles.selectBox, activePicker === 'day' && styles.selectBoxActive]}
                onPress={() => setActivePicker(activePicker === 'day' ? null : 'day')}
              >
                <Text style={day ? styles.selectText : styles.selectPlaceholder}>
                  {day ? `${day}일` : '일'}
                </Text>
                <Text style={styles.chevron}>⌄</Text>
              </Pressable>
            </View>
          </View>

          {/* 태어난 시간 + 성별 */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.labelIcon}>🕐</Text>
              <Text style={styles.label}>태어난 시간</Text>
            </View>
            <View style={styles.timeGenderRow}>
              <Pressable
                style={[
                  styles.selectBox,
                  { flex: 1 },
                  activePicker === 'birthTime' && styles.selectBoxActive,
                ]}
                onPress={() => setActivePicker(activePicker === 'birthTime' ? null : 'birthTime')}
              >
                <Text style={birthTime ? styles.selectText : styles.selectPlaceholder}>
                  {birthTime || '태어난 시간'}
                </Text>
                <Text style={styles.chevron}>⌄</Text>
              </Pressable>

              <View style={styles.genderToggle}>
                <Pressable
                  style={[styles.genderButton, gender === '남' && styles.genderButtonActive]}
                  onPress={() => setGender('남')}
                >
                  <Text style={[styles.genderText, gender === '남' && styles.genderTextActive]}>
                    남
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.genderButton, gender === '여' && styles.genderButtonActive]}
                  onPress={() => setGender('여')}
                >
                  <Text style={[styles.genderText, gender === '여' && styles.genderTextActive]}>
                    여
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* 운명 스캔 버튼 */}
        <Animated.View style={[styles.submitButtonWrapper, buttonAnimStyle]}>
          <Pressable
            style={styles.submitButton}
            onPress={handleSubmit}
            onPressIn={() => { buttonScale.value = withSpring(0.97); }}
            onPressOut={() => { buttonScale.value = withSpring(1); }}
          >
            <Text style={styles.submitButtonText}>운명 스캔 시작하기</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* 장식 요소 */}
      {decorations.map((item, index) => {
        const isCard = item.shape === 'card';
        const isCrystal = item.shape === 'crystal';
        return (
          <View
            key={index}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: item.x,
              top: item.y,
              width: isCard ? item.size * 0.7 : isCrystal ? item.size * 0.5 : item.size,
              height: item.size,
              backgroundColor: item.color,
              borderRadius: isCard ? 4 : isCrystal ? 4 : item.size,
              transform: [{ rotate: `${item.rotation || 0}deg` }],
              opacity: 0.7,
            }}
          />
        );
      })}

      {/* 드롭다운 피커 */}
      {activePicker && (
        <Pressable style={styles.pickerOverlay} onPress={() => setActivePicker(null)}>
          <Pressable style={styles.pickerContainer} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.pickerTitle}>
              {activePicker === 'year' ? '년도 선택' :
               activePicker === 'month' ? '월 선택' :
               activePicker === 'day' ? '일 선택' : '태어난 시간 선택'}
            </Text>
            <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
              {getPickerData().map((item) => (
                <Pressable
                  key={item}
                  style={styles.pickerItem}
                  onPress={() => handlePickerSelect(item)}
                >
                  <Text style={styles.pickerItemText}>
                    {activePicker === 'year' ? `${item}년` :
                     activePicker === 'month' ? `${item}월` :
                     activePicker === 'day' ? `${item}일` : item}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  scrollContent: {
    paddingBottom: 180,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 24,
  },
  moonIcon: {
    fontSize: 28,
    color: '#8B8B8B',
    marginBottom: 2,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 18,
    color: TEXT_DARK,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 28,
    fontWeight: '400',
  },
  formCard: {
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
    }),
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  labelIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    fontSize: 15,
    color: TEXT_DARK,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    fontSize: 18,
    color: PURPLE_LIGHT,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: TEXT_DARK,
    ...Platform.select({
      web: { outlineStyle: 'none' as any },
    }),
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  selectBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    paddingHorizontal: 14,
    height: 48,
  },
  selectBoxActive: {
    borderColor: PURPLE_MAIN,
    borderWidth: 1.5,
  },
  selectText: {
    fontSize: 15,
    color: TEXT_DARK,
  },
  selectPlaceholder: {
    fontSize: 15,
    color: TEXT_MUTED,
  },
  chevron: {
    fontSize: 18,
    color: TEXT_MUTED,
    marginTop: -4,
  },
  timeGenderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderToggle: {
    flexDirection: 'row',
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: GOLD_BORDER,
    overflow: 'hidden',
  },
  genderButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: PURPLE_BG,
    borderRadius: 22,
  },
  genderText: {
    fontSize: 15,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  genderTextActive: {
    color: PURPLE_MAIN,
    fontWeight: '700',
  },
  submitButtonWrapper: {
    marginHorizontal: 24,
    marginTop: 24,
  },
  submitButton: {
    backgroundColor: PURPLE_MAIN,
    borderRadius: 30,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
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
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.45,
    paddingBottom: 40,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerScroll: {
    paddingHorizontal: 20,
  },
  pickerItem: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 16,
    color: TEXT_DARK,
  },
});
