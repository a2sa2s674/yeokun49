/**
 * 인앱 결제 서비스 (RevenueCat)
 * 프리미엄 패스, 소모성 상품, 일회성 상품 관리
 */
import Purchases, {
  type PurchasesPackage,
  type CustomerInfo,
} from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEYS = {
  apple: 'YOUR_REVENUECAT_APPLE_API_KEY',
  google: 'YOUR_REVENUECAT_GOOGLE_API_KEY',
};

// ── 상품 ID (RevenueCat + 스토어 등록용) ──────────────

export const PRODUCT_IDS = {
  // 구독 (월간)
  premiumPass: 'premium_pass',               // 프리미엄 패스 — 5,900원/월

  // 소모성
  digitalTalisman: 'digital_talisman',       // 디지털 부적 — 1,900원
  extraSajuReading: 'extra_saju_reading',    // 추가 AI 풀이 — 1,900원
  restart49day: '49day_restart',             // 49일 재시작권 — 2,900원

  // 포인트 패키지 (소모성)
  pointsSmall: 'points_500',                // 500P — 1,900원
  pointsMedium: 'points_1500',              // 1,500P — 4,900원
  pointsLarge: 'points_5000',               // 5,000P — 9,900원

  // 친밀도 (소모성)
  intimacyBoostPack: 'intimacy_boost_pack',    // 친밀도 부스트팩 — 1,900원 (+50P, 프리미엄 +75P)

  // 일회성
  premiumGuardianPack: 'premium_guardian_pack', // 프리미엄 조력자 패키지 — 4,900원
} as const;

// ── 프리미엄 패스 혜택 정의 ──────────────────────────

export const PREMIUM_BENEFITS = {
  pointMultiplier: 1.5,         // 퀘스트 포인트 1.5배
  unlimitedChat: true,           // AI 수호신 채팅 무제한
  weeklyReport: true,            // 주간 AI 운세 리포트
  exclusiveQuest: true,          // 프리미엄 전용 퀘스트 +1
  monthlyCostume: true,          // 월별 한정 코스튬
  premiumBadge: true,            // 프리미엄 배지
} as const;

// ── 포인트 패키지 정의 ──────────────────────────────

export const POINT_PACKAGES = [
  { id: PRODUCT_IDS.pointsSmall,  points: 500,   price: 1900, label: '500P' },
  { id: PRODUCT_IDS.pointsMedium, points: 1500,  price: 4900, label: '1,500P' },
  { id: PRODUCT_IDS.pointsLarge,  points: 5000,  price: 9900, label: '5,000P', bonus: '최대 가성비' },
] as const;

// ── 친밀도 레벨 체계 ────────────────────────────────

export const INTIMACY_LEVELS = [
  { level: 1,  required: 0,   benefit: '기본 대화',              premium: false },
  { level: 2,  required: 10,  benefit: '전용 인사말',            premium: false },
  { level: 3,  required: 30,  benefit: '퀘스트 추천 향상',       premium: false },
  { level: 4,  required: 60,  benefit: '전용 이모지',            premium: false },
  { level: 5,  required: 100, benefit: '주간 운세 DM',           premium: true },
  { level: 6,  required: 150, benefit: '수호신 코스튬',          premium: true },
  { level: 7,  required: 210, benefit: '특별 퀘스트',            premium: true },
  { level: 8,  required: 280, benefit: '심층 AI 풀이 무제한',    premium: true },
  { level: 9,  required: 360, benefit: '수호신 스킬 강화',       premium: true },
  { level: 10, required: 450, benefit: '전설 칭호 + 특별 효과',  premium: true },
] as const;

/** 친밀도 포인트 → 레벨 계산 */
export function getIntimacyLevel(points: number): number {
  for (let i = INTIMACY_LEVELS.length - 1; i >= 0; i--) {
    if (points >= INTIMACY_LEVELS[i].required) return INTIMACY_LEVELS[i].level;
  }
  return 1;
}

/** 다음 레벨까지 남은 포인트 */
export function getIntimacyProgress(points: number): { current: number; next: number; progress: number } {
  const level = getIntimacyLevel(points);
  if (level >= 10) return { current: points, next: 450, progress: 1 };
  const currentReq = INTIMACY_LEVELS[level - 1].required;
  const nextReq = INTIMACY_LEVELS[level].required;
  return {
    current: points - currentReq,
    next: nextReq - currentReq,
    progress: (points - currentReq) / (nextReq - currentReq),
  };
}

// ── RevenueCat 초기화 ──────────────────────────────

export const initPurchases = async () => {
  const apiKey = Platform.OS === 'ios' ? API_KEYS.apple : API_KEYS.google;
  await Purchases.configure({ apiKey });
};

// ── 상품 조회 ──────────────────────────────────────

export const getProducts = async (): Promise<PurchasesPackage[]> => {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
};

// ── 구매 ──────────────────────────────────────────

export const purchaseProduct = async (
  pkg: PurchasesPackage
): Promise<CustomerInfo> => {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
};

// ── 구독 상태 확인 ──────────────────────────────────

export const checkPremiumStatus = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active['premium_pass'] !== undefined;
  } catch {
    return false;
  }
};

// ── 구매 복원 ──────────────────────────────────────

export const restorePurchases = async (): Promise<CustomerInfo> => {
  const customerInfo = await Purchases.restorePurchases();
  return customerInfo;
};
