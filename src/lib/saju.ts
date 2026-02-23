/**
 * 사주/오행 계산 유틸리티
 * lunar-javascript 기반 만세력 사주팔자 → 오행 비율 계산
 */

// lunar-javascript 타입 선언
declare module 'lunar-javascript' {
  export class Solar {
    static fromYmdHms(
      y: number, m: number, d: number,
      h: number, min: number, s: number
    ): Solar;
    getLunar(): Lunar;
  }
  export class Lunar {
    getEightChar(): EightChar;
  }
  export class EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearWuXing(): string;
    getMonthWuXing(): string;
    getDayWuXing(): string;
    getTimeWuXing(): string;
    getYearHideGan(): string[];
    getMonthHideGan(): string[];
    getDayHideGan(): string[];
    getTimeHideGan(): string[];
  }
}

import { Solar } from 'lunar-javascript';
import type { OhangKey, OhangStats } from '../types';

// ── 상수 ──────────────────────────────────────────

/** 한자 오행 → 한글 오행 */
const HANJA_TO_OHANG: Record<string, OhangKey> = {
  '木': '목', '火': '화', '土': '토', '金': '금', '水': '수',
};

/** 천간 → 오행 (지장간 변환용) */
const GAN_TO_OHANG: Record<string, OhangKey> = {
  '甲': '목', '乙': '목',
  '丙': '화', '丁': '화',
  '戊': '토', '己': '토',
  '庚': '금', '辛': '금',
  '壬': '수', '癸': '수',
};

/** scan.tsx의 BIRTH_TIMES → 시(hour) 매핑 */
const BIRTH_TIME_TO_HOUR: Record<string, number> = {
  '子시 (23:00~01:00)': 0,
  '丑시 (01:00~03:00)': 2,
  '寅시 (03:00~05:00)': 4,
  '卯시 (05:00~07:00)': 6,
  '辰시 (07:00~09:00)': 8,
  '巳시 (09:00~11:00)': 10,
  '午시 (11:00~13:00)': 12,
  '未시 (13:00~15:00)': 14,
  '申시 (15:00~17:00)': 16,
  '酉시 (17:00~19:00)': 18,
  '戌시 (19:00~21:00)': 20,
  '亥시 (21:00~23:00)': 22,
};

/** 지장간 가중치 (본기 > 중기 > 여기) */
const HIDE_GAN_WEIGHTS = [0.5, 0.3, 0.2];

// ── 인터페이스 ────────────────────────────────────

export interface SajuInput {
  name: string;
  year: number;
  month: number;
  day: number;
  birthTime: string;
  gender: '남' | '여';
}

export interface SajuResult {
  ohang: OhangStats;
  strongest: OhangKey;
  weakest: OhangKey;
  pillars: {
    year: string;
    month: string;
    day: string;
    time: string;
  };
}

// ── 핵심 함수 ─────────────────────────────────────

export function calculateOhang(input: SajuInput): SajuResult {
  const hasTime = input.birthTime !== '모름';
  const hour = hasTime
    ? (BIRTH_TIME_TO_HOUR[input.birthTime] ?? 12)
    : 12;

  // 1) Solar → Lunar → EightChar
  const solar = Solar.fromYmdHms(
    input.year, input.month, input.day, hour, 0, 0
  );
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // 2) 기본 오행 카운트 (천간+지지 = 주당 2글자)
  const counts: Record<OhangKey, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };

  const wuXings = [
    eightChar.getYearWuXing(),
    eightChar.getMonthWuXing(),
    eightChar.getDayWuXing(),
  ];
  if (hasTime) {
    wuXings.push(eightChar.getTimeWuXing());
  }

  for (const wx of wuXings) {
    for (const char of wx) {
      const key = HANJA_TO_OHANG[char];
      if (key) counts[key]++;
    }
  }

  // 3) 지장간 가중치 추가
  const hideGanArrays = [
    eightChar.getYearHideGan(),
    eightChar.getMonthHideGan(),
    eightChar.getDayHideGan(),
  ];
  if (hasTime) {
    hideGanArrays.push(eightChar.getTimeHideGan());
  }

  for (const hideGans of hideGanArrays) {
    if (!hideGans) continue;
    hideGans.forEach((gan: string, idx: number) => {
      const key = GAN_TO_OHANG[gan];
      if (key) {
        counts[key] += HIDE_GAN_WEIGHTS[idx] ?? 0.2;
      }
    });
  }

  // 4) 0~100 정규화
  const total = Object.values(counts).reduce((sum, v) => sum + v, 0);
  const ohang: OhangStats = {
    목: total > 0 ? Math.round((counts.목 / total) * 100) : 20,
    화: total > 0 ? Math.round((counts.화 / total) * 100) : 20,
    토: total > 0 ? Math.round((counts.토 / total) * 100) : 20,
    금: total > 0 ? Math.round((counts.금 / total) * 100) : 20,
    수: total > 0 ? Math.round((counts.수 / total) * 100) : 20,
  };

  // 합계 100 보정
  const diff = 100 - Object.values(ohang).reduce((s, v) => s + v, 0);
  if (diff !== 0) {
    const maxKey = (Object.keys(ohang) as OhangKey[]).reduce(
      (a, b) => (ohang[a] >= ohang[b] ? a : b)
    );
    ohang[maxKey] += diff;
  }

  // 5) 최강/최약 식별
  const entries = Object.entries(ohang) as [OhangKey, number][];
  const strongest = entries.reduce((a, b) => (a[1] >= b[1] ? a : b))[0];
  const weakest = entries.reduce((a, b) => (a[1] <= b[1] ? a : b))[0];

  // 6) 사주 간지
  const pillars = {
    year: eightChar.getYear(),
    month: eightChar.getMonth(),
    day: eightChar.getDay(),
    time: hasTime ? eightChar.getTime() : '?',
  };

  return { ohang, strongest, weakest, pillars };
}

// ── 해석 텍스트 ───────────────────────────────────

const OHANG_DESC: Record<OhangKey, {
  emoji: string;
  hanja: string;
  summaryPhrase: string;
  strongTitle: string;
  strongDesc: string;
  weakTitle: string;
  weakDesc: string;
}> = {
  목: {
    emoji: '🌳',
    hanja: '木',
    summaryPhrase: '뿌리 깊은 나무처럼 꿋꿋한 성장의 기운을 타고났습니다',
    strongTitle: '성장하는 나무의 힘',
    strongDesc: '끊임없이 뻗어나가는 생명력과 창의력이 뛰어나며, 새로운 도전을 두려워하지 않는 개척자의 기운입니다.',
    weakTitle: '뿌리가 약한 나무',
    weakDesc: '목의 기운이 부족하여 새로운 시작에 주저함이 있을 수 있습니다.',
  },
  화: {
    emoji: '🔥',
    hanja: '火',
    summaryPhrase: '뜨거운 불꽃처럼 맹렬한 기운을 타고났습니다',
    strongTitle: '타오르는 불꽃의 열정',
    strongDesc: '열정과 추진력이 뛰어나며, 장애물을 돌파하는 힘이 강합니다.',
    weakTitle: '꺼져가는 불씨',
    weakDesc: '화의 기운이 부족하여 열정과 활력이 쉽게 소진될 수 있습니다.',
  },
  토: {
    emoji: '🏔',
    hanja: '土',
    summaryPhrase: '산처럼 묵직한 안정의 기운을 타고났습니다',
    strongTitle: '흔들리지 않는 대지의 안정',
    strongDesc: '중심을 잡아주는 든든한 신뢰감이 있으며, 사람들이 기대고 싶은 존재입니다.',
    weakTitle: '갈라진 땅',
    weakDesc: '토의 기운이 부족하여 안정감과 집중력이 흔들릴 수 있습니다.',
  },
  금: {
    emoji: '⚔️',
    hanja: '金',
    summaryPhrase: '날카로운 금속처럼 단단한 의지의 기운을 타고났습니다',
    strongTitle: '날카로운 검의 결단력',
    strongDesc: '확고한 의지와 결단력으로 목표를 향해 나아가며, 맺고 끊음이 확실합니다.',
    weakTitle: '무뎌진 칼날',
    weakDesc: '금의 기운이 부족하여 결단의 순간에 망설임이 클 수 있습니다.',
  },
  수: {
    emoji: '🌊',
    hanja: '水',
    summaryPhrase: '깊은 바다처럼 고요한 지혜의 기운을 타고났습니다',
    strongTitle: '깊은 물의 지혜',
    strongDesc: '깊은 사고력과 직관력을 가졌으며, 물처럼 유연하게 어떤 상황에도 적응합니다.',
    weakTitle: '마른 우물',
    weakDesc: '수의 기운이 부족하여 감정 기복이 심할 수 있습니다.',
  },
};

export function getOhangInterpretation(strongest: OhangKey, weakest: OhangKey) {
  const s = OHANG_DESC[strongest];
  const w = OHANG_DESC[weakest];

  return {
    summaryText: `${s.emoji} ${s.summaryPhrase}`,
    strengthCard: {
      icon: '⚔',
      title: '타고난 무기 (강점)',
      description: s.strongDesc,
      element: strongest,
    },
    weaknessCard: {
      icon: '🛡',
      title: '뚫린 방어구 (약점)',
      description: w.weakDesc,
      element: weakest,
    },
    ctaText: `당신의 부족한 기운(${w.hanja})을 채워줄 수호신을 찾아보세요`,
  };
}
