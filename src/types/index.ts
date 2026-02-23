export type OhangKey = '목' | '화' | '토' | '금' | '수';

export interface OhangStats {
  목: number; // 0~100
  화: number;
  토: number;
  금: number;
  수: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  birthDate: string; // 'YYYY-MM-DD'
  birthTime: string | null; // 'HH:MM', 시간 모르면 null
  isLunar: boolean;
  ohang: OhangStats;
  weakestElement: OhangKey;
  guardianId: string;
  questStartDate: string; // ISO 날짜
  dayIndex: number; // 0~48 (49일 중 오늘)
}

export interface Quest {
  id: string;
  element: OhangKey;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  completed: boolean;
  point: number;
}

export interface Guardian {
  id: string;
  name: string;
  element: OhangKey;
  description: string;
  lottieFile: string; // assets/lottie/{id}.json
  isPremium: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'guardian';
  content: string;
  timestamp: number;
}

// ── AI 사주 풀이 ──────────────────────────────────

export interface SajuReadingSection {
  title: string;   // "성격/성향", "재운(財運)" 등
  icon: string;    // "🧬", "💰" 등
  content: string; // AI 생성 텍스트
}

export interface SajuReading {
  sections: SajuReadingSection[];
  summary: string;
  generatedAt: string;
  /** 캐시 키: "birthDate|birthTime|gender" 형식으로 중복 호출 방지 */
  cacheKey: string;
}
