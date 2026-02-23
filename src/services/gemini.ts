/**
 * Gemini AI 사주 풀이 클라이언트 서비스
 * Firebase Cloud Function을 호출하여 AI 기반 사주 해석을 받아옵니다.
 */
import type { SajuReading } from '../types';

// Firebase Cloud Function URL
// TODO: Firebase 프로젝트 생성 후 실제 프로젝트 ID로 교체
const FIREBASE_PROJECT_ID = 'yeokun49';
const FUNCTION_REGION = 'asia-northeast3';

const FUNCTION_BASE_URL =
  typeof __DEV__ !== 'undefined' && __DEV__
    ? `http://127.0.0.1:5001/${FIREBASE_PROJECT_ID}/${FUNCTION_REGION}`
    : `https://${FUNCTION_REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net`;

/** 요청 타임아웃 (15초) */
const TIMEOUT_MS = 15000;

export interface FetchSajuReadingParams {
  pillars: { year: string; month: string; day: string; time: string };
  ohang: { 목: number; 화: number; 토: number; 금: number; 수: number };
  strongest: string;
  weakest: string;
  gender: '남' | '여';
  name: string;
}

/**
 * Cloud Function을 호출하여 AI 사주 풀이를 생성합니다.
 * @throws 네트워크 오류, 타임아웃, 서버 에러 시 예외 발생
 */
export async function fetchSajuReading(
  params: FetchSajuReadingParams
): Promise<Omit<SajuReading, 'cacheKey'>> {
  const url = `${FUNCTION_BASE_URL}/generateSajuReading`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Saju reading failed (${response.status}): ${errorBody}`);
    }

    return response.json();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('사주 풀이 요청 시간이 초과되었습니다.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
