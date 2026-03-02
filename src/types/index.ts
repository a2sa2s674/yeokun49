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
  /** 특별 미션 여부 (사진 인증 필요) */
  isSpecial?: boolean;
  /** 특별 미션 인증 사진 URI */
  photoUri?: string | null;
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
  /** 수호신 메시지에 퀘스트 수락 버튼 포함 시 */
  questAction?: {
    type: 'quest_accept';
    questTitle: string;
    questId: string;
    accepted: boolean;
  };
  /** 주간 운세 리포트 (특수 메시지) */
  weeklyReport?: WeeklyReport;
}

export interface QuickAction {
  id: string;
  emoji: string;
  label: string;
  action: 'ask_omen' | 'change_quest' | 'get_comfort' | 'today_fortune';
  /** 친밀도 보너스 포인트 (기본 0) */
  intimacyBonus?: number;
}

// ── 주간 AI 운세 리포트 ────────────────────────────

export interface WeeklyReportSection {
  title: string;
  icon: string;
  content: string;
}

export interface WeeklyReport {
  weekKey: string;           // "2026-W10"
  greeting: string;          // 수호신 인사말
  overview: string;          // 전체 운세 요약
  sections: WeeklyReportSection[];  // 5개 섹션
  luckyDay: string;          // 행운의 요일
  luckyElement: OhangKey;    // 행운의 오행
  weeklyAffirmation: string; // 긍정 확언
  generatedAt: string;       // ISO timestamp
  guardianId: string;
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
