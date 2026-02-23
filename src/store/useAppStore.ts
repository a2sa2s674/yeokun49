/**
 * Zustand 앱 전역 스토어
 * 온보딩 데이터, 49일 사이클, 포인트, 일일 데이터 관리
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { OhangStats, OhangKey, Quest, SajuReading } from '../types';

// ── 타입 정의 ────────────────────────────────────

export interface DailyWarning {
  id: string;
  type: 'warning' | 'blessing';
  title: string;
  description: string;
  element: OhangKey;
}

export interface SubGuardian {
  id: string;
  name: string;
  element: OhangKey;
  buffLabel: string;
  emoji: string;
}

interface AppState {
  // ── 인증 ──
  userId: string | null;
  userEmail: string | null;
  loginProvider: 'google' | 'kakao' | null;

  // ── 유저 프로필 ──
  userName: string;
  birthDate: string;
  birthTime: string | null;
  gender: '남' | '여';
  ohang: OhangStats;
  weakestElement: OhangKey;
  strongestElement: OhangKey;

  // ── 수호신 ──
  guardianId: string | null;

  // ── 49일 사이클 ──
  questStartDate: string | null;
  dayIndex: number;

  // ── 길/흉 게이지 (0~100, 50이 중립) ──
  fortuneGauge: number;

  // ── 포인트 ──
  points: number;

  // ── 일일 데이터 ──
  dailyWarning: DailyWarning | null;
  todayQuests: Quest[];

  // ── 보조 조력자 ──
  subGuardians: SubGuardian[];

  // ── 알림 ──
  hasUnreadNotification: boolean;

  // ── 온보딩 완료 ──
  onboardingComplete: boolean;

  // ── AI 사주 풀이 ──
  sajuReading: SajuReading | null;
  sajuReadingLoading: boolean;

  // ── 액션 ──
  setAuthUser: (userId: string, email: string, provider: 'google' | 'kakao') => void;
  clearAuth: () => void;
  setUserProfile: (profile: {
    userName: string;
    birthDate: string;
    birthTime: string | null;
    gender: '남' | '여';
    ohang: OhangStats;
    weakestElement: OhangKey;
    strongestElement: OhangKey;
  }) => void;
  setGuardian: (guardianId: string) => void;
  startQuest49: () => void;
  advanceDay: () => void;
  addPoints: (amount: number) => void;
  completeQuest: (questId: string) => void;
  setDailyWarning: (warning: DailyWarning) => void;
  setTodayQuests: (quests: Quest[]) => void;
  addSubGuardian: (sub: SubGuardian) => void;
  markNotificationRead: () => void;
  setFortuneGauge: (value: number) => void;
  adjustFortuneGauge: (delta: number) => void;
  setQuestPhoto: (questId: string, photoUri: string) => void;
  setSajuReading: (reading: SajuReading) => void;
  setSajuReadingLoading: (loading: boolean) => void;
  resetStore: () => void;
}

// ── 초기 상태 ────────────────────────────────────

const initialOhang: OhangStats = { 목: 20, 화: 20, 토: 20, 금: 20, 수: 20 };

// ── 스토어 생성 ──────────────────────────────────

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 초기값
      userId: null,
      userEmail: null,
      loginProvider: null,
      userName: '',
      birthDate: '',
      birthTime: null,
      gender: '남',
      ohang: initialOhang,
      weakestElement: '수',
      strongestElement: '화',
      guardianId: null,
      questStartDate: null,
      dayIndex: 0,
      fortuneGauge: 50,
      points: 1200,
      dailyWarning: null,
      todayQuests: [],
      subGuardians: [],
      hasUnreadNotification: true,
      onboardingComplete: false,
      sajuReading: null,
      sajuReadingLoading: false,

      // 액션
      setAuthUser: (userId, email, provider) =>
        set({ userId, userEmail: email, loginProvider: provider }),

      clearAuth: () =>
        set({ userId: null, userEmail: null, loginProvider: null }),

      setUserProfile: (profile) =>
        set({
          userName: profile.userName,
          birthDate: profile.birthDate,
          birthTime: profile.birthTime,
          gender: profile.gender,
          ohang: profile.ohang,
          weakestElement: profile.weakestElement,
          strongestElement: profile.strongestElement,
        }),

      setGuardian: (guardianId) =>
        set({ guardianId }),

      startQuest49: () =>
        set({
          questStartDate: new Date().toISOString().split('T')[0],
          dayIndex: 0,
          onboardingComplete: true,
        }),

      advanceDay: () =>
        set((state) => ({
          dayIndex: Math.min(state.dayIndex + 1, 48),
        })),

      addPoints: (amount) =>
        set((state) => ({
          points: state.points + amount,
        })),

      completeQuest: (questId) =>
        set((state) => {
          const quest = state.todayQuests.find((q) => q.id === questId);
          const pointsToAdd = quest && !quest.completed ? quest.point : 0;
          const gaugeBoost = quest && !quest.completed ? (quest.isSpecial ? 8 : 4) : 0;
          return {
            todayQuests: state.todayQuests.map((q) =>
              q.id === questId ? { ...q, completed: true } : q
            ),
            points: state.points + pointsToAdd,
            fortuneGauge: Math.min(100, state.fortuneGauge + gaugeBoost),
          };
        }),

      setDailyWarning: (warning) =>
        set({ dailyWarning: warning }),

      setTodayQuests: (quests) =>
        set({ todayQuests: quests }),

      addSubGuardian: (sub) =>
        set((state) => ({
          subGuardians: [...state.subGuardians.slice(0, 1), sub],
        })),

      markNotificationRead: () =>
        set({ hasUnreadNotification: false }),

      setFortuneGauge: (value) =>
        set({ fortuneGauge: Math.max(0, Math.min(100, value)) }),

      adjustFortuneGauge: (delta) =>
        set((state) => ({
          fortuneGauge: Math.max(0, Math.min(100, state.fortuneGauge + delta)),
        })),

      setQuestPhoto: (questId, photoUri) =>
        set((state) => ({
          todayQuests: state.todayQuests.map((q) =>
            q.id === questId ? { ...q, photoUri } : q
          ),
        })),

      setSajuReading: (reading) =>
        set({ sajuReading: reading, sajuReadingLoading: false }),

      setSajuReadingLoading: (loading) =>
        set({ sajuReadingLoading: loading }),

      resetStore: () =>
        set({
          userId: null,
          userEmail: null,
          loginProvider: null,
          userName: '',
          birthDate: '',
          birthTime: null,
          gender: '남',
          ohang: initialOhang,
          weakestElement: '수',
          strongestElement: '화',
          guardianId: null,
          questStartDate: null,
          dayIndex: 0,
          fortuneGauge: 50,
          points: 1200,
          dailyWarning: null,
          todayQuests: [],
          subGuardians: [],
          hasUnreadNotification: true,
          onboardingComplete: false,
          sajuReading: null,
          sajuReadingLoading: false,
        }),
    }),
    {
      name: 'yeokun49-storage',
      // 웹에서는 localStorage 사용 (AsyncStorage는 import.meta 이슈 있음)
      storage: createJSONStorage(() => localStorage),
    }
  )
);
