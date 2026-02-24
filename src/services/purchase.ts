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
