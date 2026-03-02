/**
 * 주간 AI 운세 리포트 — 캐시 오케스트레이션
 * Zustand → Firestore → Cloud Function 순으로 조회/생성
 */
import type { WeeklyReport } from '../types';
import { useAppStore } from '../store';
import { loadWeeklyReport, saveWeeklyReport } from './firestore';
import { fetchWeeklyReport } from './gemini';
import { getGuardianById } from '../data/guardians';

/** ISO 주차 키 생성 (예: "2026-W10") */
export function getISOWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // 목요일 기준으로 해당 주의 연도와 주 번호 계산
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    );
  return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

/**
 * 주간 리포트를 가져옵니다.
 * 1) Zustand 캐시 → 2) Firestore 캐시 → 3) Cloud Function 생성
 */
export async function getOrFetchWeeklyReport(uid: string): Promise<WeeklyReport | null> {
  const weekKey = getISOWeekKey(new Date());
  const store = useAppStore.getState();

  // 1) Zustand 캐시 확인
  if (store.weeklyReport?.weekKey === weekKey) {
    return store.weeklyReport;
  }

  store.setWeeklyReportLoading(true);

  try {
    // 2) Firestore 캐시 확인
    if (uid) {
      const cached = await loadWeeklyReport(uid, weekKey);
      if (cached) {
        store.setWeeklyReport(cached);
        return cached;
      }
    }

    // 3) Cloud Function 호출
    const guardian = store.guardianId ? getGuardianById(store.guardianId) : null;
    if (!guardian) {
      store.setWeeklyReportLoading(false);
      return null;
    }

    const report = await fetchWeeklyReport({
      name: store.userName,
      gender: store.gender,
      ohang: store.ohang,
      strongest: store.strongestElement,
      weakest: store.weakestElement,
      guardianId: guardian.id,
      guardianName: guardian.name,
      guardianElement: `${guardian.element}(${guardian.elementHanja})`,
      dayIndex: store.dayIndex,
      fortuneGauge: store.fortuneGauge,
      weekKey,
    });

    store.setWeeklyReport(report);

    // Firestore에 저장 (비동기, 실패해도 무시)
    if (uid) {
      saveWeeklyReport(uid, report).catch((err) =>
        console.warn('Failed to save weekly report to Firestore:', err)
      );
    }

    return report;
  } catch (error) {
    console.error('Failed to get weekly report:', error);
    store.setWeeklyReportLoading(false);
    return null;
  }
}
