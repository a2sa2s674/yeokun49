/**
 * 점사(수호신) 캐릭터 데이터
 * 오행 기반 5종 기본 캐릭터 + 확장 가능한 구조
 */
import type { OhangKey } from '../types';

export interface GuardianData {
  id: string;
  name: string;
  hanja: string;
  element: OhangKey;
  elementHanja: string;
  title: string;           // "물(水)을 다루는 자"
  motif: string;           // 모티브 동물
  description: string;     // 짧은 소개
  personality: string;     // 성격/분위기
  appearance: string;      // 외형 설명
  specialFeature: string;  // 특별한 특징
  isPremium: boolean;
  // 오소/확신 스탯 (5단계, 각 오행별)
  stats: {
    ohso: Record<OhangKey, number>;   // 오소 (0~5)
    hwaksin: Record<OhangKey, number>; // 확신 (0~5)
  };
  // 카드 색상 테마
  theme: {
    primary: string;
    secondary: string;
    glow: string;
    cardBorder: string;
    bgGradientStart: string;
    bgGradientEnd: string;
  };
}

export const GUARDIANS: GuardianData[] = [
  {
    id: 'cheongmyeong',
    name: '청명',
    hanja: '淸明',
    element: '수',
    elementHanja: '水',
    title: '물(水)을 다루는 자',
    motif: '해태(해치) + 물의 정령',
    description: '깊은 바다의 지혜를 품은 신비로운 수호신. 물처럼 유연하게 흐르며 감정의 균형을 잡아줍니다.',
    personality: '고요하고 신비로우며, 깊은 통찰력으로 마음의 평화를 가져다주는 수호신',
    appearance: '투명한 청록빛 비늘과 물방울 장식이 달린 귀여운 해태 형태',
    specialFeature: '몸 주변으로 맑은 물결이 끊임없이 흐르며, 이마의 보석에서 달빛이 비침',
    isPremium: false,
    stats: {
      ohso: { 수: 5, 목: 4, 금: 3, 화: 2, 토: 1 },
      hwaksin: { 수: 5, 목: 3, 금: 4, 화: 1, 토: 2 },
    },
    theme: {
      primary: '#0EA5E9',
      secondary: '#67E8F9',
      glow: 'rgba(14, 165, 233, 0.3)',
      cardBorder: '#7DD3FC',
      bgGradientStart: '#E0F7FF',
      bgGradientEnd: '#BAE6FD',
    },
  },
  {
    id: 'yeomhwa',
    name: '염화',
    hanja: '炎火',
    element: '화',
    elementHanja: '火',
    title: '불(火)을 다루는 자',
    motif: '불삽살개 + 불의 정령',
    description: '뜨거운 열정으로 액운을 불태우는 용맹한 수호신. 어둠 속에서 빛이 되어줍니다.',
    personality: '활기차고 용맹하며, 나쁜 기운을 불태워버리는 든든한 수호신',
    appearance: '털이 불꽃처럼 일렁이는 복슬복슬한 강아지 형태의 신수',
    specialFeature: '이마에 태극 불꽃 문양, 꼬리와 발 끝에서 작은 불씨가 톡톡 튐',
    isPremium: false,
    stats: {
      ohso: { 화: 5, 토: 4, 목: 3, 금: 2, 수: 1 },
      hwaksin: { 화: 5, 토: 3, 목: 4, 금: 1, 수: 2 },
    },
    theme: {
      primary: '#EF4444',
      secondary: '#FCA5A5',
      glow: 'rgba(239, 68, 68, 0.3)',
      cardBorder: '#FCA5A5',
      bgGradientStart: '#FFF1F0',
      bgGradientEnd: '#FEE2E2',
    },
  },
  {
    id: 'taepung',
    name: '태풍',
    hanja: '颱風',
    element: '목',
    elementHanja: '木',
    title: '나무(木)를 다루는 자',
    motif: '아기 호랑이(산군) + 바람과 나뭇잎의 정령',
    description: '자유로운 바람을 타고 새로운 생명력을 불어넣는 수호신. 정체된 기운을 깨뜨립니다.',
    personality: '생기 넘치고 자유분방하며, 새로운 활력을 불어넣는 수호신',
    appearance: '날렵하고 장난기 넘치는 표정의 아기 호랑이 형태의 신수',
    specialFeature: '꼬리 끝이 회오리바람 모양, 몸 주변을 맴도는 나뭇잎과 산들바람 오라',
    isPremium: false,
    stats: {
      ohso: { 목: 5, 화: 4, 수: 3, 토: 2, 금: 1 },
      hwaksin: { 목: 5, 화: 3, 수: 4, 토: 1, 금: 2 },
    },
    theme: {
      primary: '#22C55E',
      secondary: '#86EFAC',
      glow: 'rgba(34, 197, 94, 0.3)',
      cardBorder: '#86EFAC',
      bgGradientStart: '#F0FFF4',
      bgGradientEnd: '#DCFCE7',
    },
  },
  {
    id: 'musoe',
    name: '무쇠',
    hanja: '武釗',
    element: '금',
    elementHanja: '金',
    title: '쇠(金)를 다루는 자',
    motif: '현무/거북이 + 바위와 쇠의 정령',
    description: '어떤 액운도 막아내는 철벽의 수호신. 묵직한 의지로 당신을 지켜줍니다.',
    personality: '묵묵하고 우직하며, 어떤 액운도 막아내는 든든한 방패 같은 수호신',
    appearance: '몸이 암석과 금속으로 이루어진 단단하고 듬직한 거북이 형태의 신수',
    specialFeature: '등껍질에 새겨진 팔괘 문양, 묵직하고 단단한 방어막 같은 기운을 방출',
    isPremium: false,
    stats: {
      ohso: { 금: 5, 토: 4, 수: 3, 화: 2, 목: 1 },
      hwaksin: { 금: 5, 토: 3, 수: 4, 화: 1, 목: 2 },
    },
    theme: {
      primary: '#A1A1AA',
      secondary: '#D4D4D8',
      glow: 'rgba(161, 161, 170, 0.3)',
      cardBorder: '#D4D4D8',
      bgGradientStart: '#FAFAFA',
      bgGradientEnd: '#E4E4E7',
    },
  },
  {
    id: 'hwangto',
    name: '황토',
    hanja: '黃土',
    element: '토',
    elementHanja: '土',
    title: '흙(土)을 다루는 자',
    motif: '아기 곰(단군신화) + 비옥한 흙과 땅의 정령',
    description: '따뜻한 대지의 품처럼 복과 안정을 가져다주는 수호신. 흔들리는 마음을 다잡아줍니다.',
    personality: '온화하고 인내심이 강하며, 복과 안정을 가져다주는 어머니 같은 수호신',
    appearance: '둥글둥글하고 푸근한 인상의 아기 곰 형태의 신수',
    specialFeature: '머리 위에 작은 새싹이 돋아있음, 배에 복주머니 무늬, 따뜻한 아지랑이 오라',
    isPremium: false,
    stats: {
      ohso: { 토: 5, 화: 4, 금: 3, 목: 2, 수: 1 },
      hwaksin: { 토: 5, 화: 3, 금: 4, 목: 1, 수: 2 },
    },
    theme: {
      primary: '#D97706',
      secondary: '#FCD34D',
      glow: 'rgba(217, 119, 6, 0.3)',
      cardBorder: '#FCD34D',
      bgGradientStart: '#FFFBEB',
      bgGradientEnd: '#FEF3C7',
    },
  },
];

/** 가장 약한 오행에 맞는 수호신 추천 */
export function getRecommendedGuardian(weakestElement: OhangKey): GuardianData {
  return GUARDIANS.find((g) => g.element === weakestElement) ?? GUARDIANS[0];
}

/** ID로 수호신 찾기 */
export function getGuardianById(id: string): GuardianData | undefined {
  return GUARDIANS.find((g) => g.id === id);
}
