/**
 * 목 데이터 — 일일 흉살, 퀘스트, 보조 조력자
 * Firebase 연동 전까지 사용
 *
 * 2026-03-02 (월) — 병오년 경인월 임진일
 * 일간: 壬(임수) → 수(水) 기운이 강한 날
 * 지지: 辰(진토) → 토(土) 충돌 주의
 * 오행 흐름: 수 > 토 상극 → 감정 불안정 가능, 목(木) 통관 필요
 */
import type { Quest, OhangKey } from '../types';
import type { DailyWarning, SubGuardian } from '../store';

// ── 2026-03-02 오늘의 흉살 ────────────────────────────
export const MOCK_DAILY_WARNINGS: DailyWarning[] = [
  {
    id: 'w-20260302-1',
    type: 'warning',
    title: '감정 기복 주의!',
    description:
      '임수(壬水) 일간에 진토(辰土)가 충돌합니다. 감정이 요동칠 수 있으니, 중요한 결정은 오후로 미루세요.',
    element: '수',
  },
  {
    id: 'w-20260302-2',
    type: 'warning',
    title: '소화기 건강 조심',
    description:
      '수토(水土) 상극 기운이 위장에 영향을 줍니다. 찬 음식을 피하고 따뜻한 차를 마셔보세요.',
    element: '토',
  },
  {
    id: 'w-20260302-3',
    type: 'warning',
    title: '대인관계 오해 가능',
    description:
      '경금(庚金) 월간의 영향으로 말이 날카로워질 수 있습니다. 메신저 답장은 한 번 더 읽고 보내세요.',
    element: '금',
  },
];

// ── 2026-03-02 오늘의 퀘스트 ──────────────────────────
export const MOCK_QUESTS: Quest[] = [
  {
    id: 'q-20260302-1',
    element: '목',
    title: '초록색 음식 먹기',
    description:
      '수토 상극을 완화하는 통관 오행! 목(木)의 기운을 보충하면 감정이 안정됩니다. 샐러드, 녹즙, 나물 아무거나 OK.',
    difficulty: 1,
    completed: false,
    point: 10,
  },
  {
    id: 'q-20260302-2',
    element: '목',
    title: '산책 15분 하기',
    description:
      '나무와 풀이 있는 곳을 걸으며 목(木) 기운을 흡수하세요. 자연의 생기가 흐트러진 오행을 바로잡아 줍니다.',
    difficulty: 1,
    completed: false,
    point: 10,
  },
  {
    id: 'q-20260302-3',
    element: '화',
    title: '감사 일기 쓰고 사진 찍기',
    description:
      '화(火)의 따뜻한 기운으로 냉철해진 마음을 녹이세요. 오늘 감사한 일 3가지를 적고 인증 사진을 찍어보세요.',
    difficulty: 2,
    completed: false,
    point: 50,
    isSpecial: true,
    photoUri: null,
  },
];

// ── 보조 조력자 ───────────────────────────────────────
export const MOCK_SUB_GUARDIANS: SubGuardian[] = [
  {
    id: 'sub-dragon',
    name: '청룡',
    element: '목',
    buffLabel: '목 기운 +8%',
    emoji: '🐉',
  },
];

/** 오늘(2026-03-02)의 목 데이터 제공 */
export function getDayOneMockData() {
  const warningIndex = Math.floor(Math.random() * MOCK_DAILY_WARNINGS.length);
  return {
    dailyWarning: MOCK_DAILY_WARNINGS[warningIndex],
    todayQuests: MOCK_QUESTS,
    subGuardians: MOCK_SUB_GUARDIANS,
  };
}
