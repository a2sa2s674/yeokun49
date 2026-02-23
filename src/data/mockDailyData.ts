/**
 * 목 데이터 — 일일 흉살, 퀘스트, 보조 조력자
 * Firebase 연동 전까지 사용
 */
import type { Quest, OhangKey } from '../types';
import type { DailyWarning, SubGuardian } from '../store';

export const MOCK_DAILY_WARNINGS: DailyWarning[] = [
  {
    id: 'w1',
    type: 'warning',
    title: '구설수 조심!',
    description: '오늘은 말실수에 주의하세요. 불필요한 논쟁을 피하면 평화로운 하루를 보낼 수 있습니다.',
    element: '화',
  },
  {
    id: 'w2',
    type: 'warning',
    title: '재물 손실 주의',
    description: '충동적인 소비를 자제하세요. 오늘은 지갑을 단단히 잠가야 할 날입니다.',
    element: '금',
  },
  {
    id: 'w3',
    type: 'warning',
    title: '건강 관리 필요',
    description: '무리한 활동을 삼가고 충분한 수분 섭취를 하세요.',
    element: '수',
  },
];

export const MOCK_QUESTS: Quest[] = [
  {
    id: 'q1',
    element: '수',
    title: '따뜻한 차 한 잔 마시기',
    description: '수(水)의 기운을 보충합니다. 따뜻한 차를 마시며 마음을 가라앉혀보세요.',
    difficulty: 1,
    completed: false,
    point: 50,
  },
  {
    id: 'q2',
    element: '목',
    title: '10분 산책하기',
    description: '목(木)의 기운을 보충합니다. 자연 속에서 깊게 호흡해보세요.',
    difficulty: 1,
    completed: false,
    point: 80,
  },
  {
    id: 'q3',
    element: '화',
    title: '좋아하는 사람에게 연락하기',
    description: '화(火)의 기운을 활성화합니다. 따뜻한 마음을 전해보세요.',
    difficulty: 2,
    completed: false,
    point: 100,
  },
];

export const MOCK_SUB_GUARDIANS: SubGuardian[] = [
  {
    id: 'sub1',
    name: '여우',
    element: '금',
    buffLabel: '재물운 +5%',
    emoji: '🦊',
  },
];

/** 1일차 목 데이터 제공 */
export function getDayOneMockData() {
  const warningIndex = Math.floor(Math.random() * MOCK_DAILY_WARNINGS.length);
  return {
    dailyWarning: MOCK_DAILY_WARNINGS[warningIndex],
    todayQuests: MOCK_QUESTS,
    subGuardians: MOCK_SUB_GUARDIANS,
  };
}
