/**
 * 오늘의 운세 — 캐시 오케스트레이션
 * Zustand → Firestore → Cloud Function 순으로 조회/생성
 */
import type { DailyFortune } from '../types';
import { useAppStore } from '../store';
import { getGuardianById } from '../data/guardians';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Firebase Cloud Function URL
const FIREBASE_PROJECT_ID = 'yeokun49';
const FUNCTION_REGION = 'asia-northeast3';

const FUNCTION_BASE_URL =
  typeof __DEV__ !== 'undefined' && __DEV__
    ? `http://127.0.0.1:5001/${FIREBASE_PROJECT_ID}/${FUNCTION_REGION}`
    : `https://${FUNCTION_REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net`;

const TIMEOUT_MS = 60000;

/** 오늘 날짜의 오행 + 특징 계산 (간이 버전) */
function getTodayElementInfo(date: string): { element: string; feature: string } {
  // 천간에 따른 오행 매핑 (일간 기준 간이 계산)
  const d = new Date(date);
  const baseDate = new Date('1900-01-01');
  const diffDays = Math.floor((d.getTime() - baseDate.getTime()) / 86400000);
  const ganIndex = diffDays % 10;
  const ganElements: [string, string][] = [
    ['목(木)', '갑목(甲木)일 — 새로운 시작의 기운'],
    ['목(木)', '을목(乙木)일 — 유연한 성장의 기운'],
    ['화(火)', '병화(丙火)일 — 강렬한 태양의 기운'],
    ['화(火)', '정화(丁火)일 — 은은한 촛불의 기운'],
    ['토(土)', '무토(戊土)일 — 큰 산의 안정 기운'],
    ['토(土)', '기토(己土)일 — 비옥한 대지의 기운'],
    ['금(金)', '경금(庚金)일 — 날카로운 결단의 기운'],
    ['금(金)', '신금(辛金)일 — 보석 같은 세련의 기운'],
    ['수(水)', '임수(壬水)일 — 넓은 바다의 기운'],
    ['수(水)', '계수(癸水)일 — 맑은 이슬의 기운'],
  ];
  return {
    element: ganElements[ganIndex][0],
    feature: ganElements[ganIndex][1],
  };
}

/** 수호신 성격 텍스트 매핑 */
const GUARDIAN_PERSONALITIES: Record<string, string> = {
  cheongmyeong: '고요하고 신비로우며, 깊은 통찰력으로 마음의 평화를 가져다주는',
  yeomhwa: '활기차고 용맹하며, 나쁜 기운을 불태워버리는 든든한',
  taepung: '생기 넘치고 자유분방하며, 새로운 활력을 불어넣는',
  musoe: '묵묵하고 우직하며, 어떤 액운도 막아내는 든든한 방패 같은',
  hwangto: '온화하고 인내심이 강하며, 복과 안정을 가져다주는 어머니 같은',
};

/**
 * 오늘의 운세를 가져옵니다.
 * 1) Zustand 캐시 → 2) Firestore 캐시 → 3) Cloud Function 생성
 */
export async function getOrFetchDailyFortune(uid: string): Promise<DailyFortune | null> {
  const todayDate = new Date().toISOString().split('T')[0];
  const store = useAppStore.getState();

  // 1) Zustand 캐시 확인
  if (store.dailyFortune?.todayDate === todayDate) {
    return store.dailyFortune;
  }

  store.setDailyFortuneLoading(true);

  try {
    // 2) Firestore 캐시 확인 (로그인 사용자만)
    const hasRealUid = uid && uid !== 'anonymous';
    if (hasRealUid) {
      const cacheRef = doc(db, 'users', uid, 'daily_fortunes', todayDate);
      const snapshot = await getDoc(cacheRef);
      if (snapshot.exists()) {
        const cached = snapshot.data() as DailyFortune;
        store.setDailyFortune(cached);
        return cached;
      }
    }

    // 3) Cloud Function 호출
    const guardian = store.guardianId ? getGuardianById(store.guardianId) : null;
    if (!guardian) {
      store.setDailyFortuneLoading(false);
      return null;
    }

    const { element, feature } = getTodayElementInfo(todayDate);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${FUNCTION_BASE_URL}/getTodayFortune`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          userName: store.userName,
          guardianName: guardian.name,
          guardianPersonality: GUARDIAN_PERSONALITIES[guardian.id] || '',
          mainElement: store.strongestElement,
          lackingElement: store.weakestElement,
          todayDate,
          todayElement: element,
          todayFeature: feature,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new Error(`Today fortune failed (${response.status}): ${errorBody}`);
      }

      const fortune: DailyFortune = await response.json();
      store.setDailyFortune(fortune);

      // Firestore 클라이언트 캐시도 저장 (비동기, 실패 무시)
      if (hasRealUid) {
        const cacheRef = doc(db, 'users', uid, 'daily_fortunes', todayDate);
        setDoc(cacheRef, fortune).catch((err) =>
          console.warn('Failed to cache daily fortune locally:', err)
        );
      }

      return fortune;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error: any) {
    console.error('Failed to get daily fortune:', error);
    store.setDailyFortuneLoading(false);
    return null;
  }
}
