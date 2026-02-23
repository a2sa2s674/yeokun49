/**
 * Firestore 사용자 데이터 동기화
 */
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAppStore } from '../store';

// ── 유저 프로필 저장 ──
export async function saveUserProfile(uid: string): Promise<void> {
  const state = useAppStore.getState();
  const userRef = doc(db, 'users', uid);

  await setDoc(userRef, {
    profile: {
      userName: state.userName,
      birthDate: state.birthDate,
      birthTime: state.birthTime,
      gender: state.gender,
    },
    saju: {
      ohang: state.ohang,
      strongestElement: state.strongestElement,
      weakestElement: state.weakestElement,
    },
    quest: {
      guardianId: state.guardianId,
      dayIndex: state.dayIndex,
      fortuneGauge: state.fortuneGauge,
      points: state.points,
      questStartDate: state.questStartDate,
      onboardingComplete: state.onboardingComplete,
    },
    subGuardians: state.subGuardians,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

// ── 유저 프로필 복원 ──
export async function loadUserProfile(uid: string): Promise<boolean> {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return false; // 데이터 없음 → 온보딩 필요
  }

  const data = snapshot.data();
  const store = useAppStore.getState();

  // 프로필 복원
  if (data.profile) {
    store.setUserProfile({
      userName: data.profile.userName || '',
      birthDate: data.profile.birthDate || '',
      birthTime: data.profile.birthTime || null,
      gender: data.profile.gender || '남',
      ohang: data.saju?.ohang || { 목: 20, 화: 20, 토: 20, 금: 20, 수: 20 },
      weakestElement: data.saju?.weakestElement || '수',
      strongestElement: data.saju?.strongestElement || '화',
    });
  }

  // 퀘스트 데이터 복원
  if (data.quest) {
    if (data.quest.guardianId) store.setGuardian(data.quest.guardianId);
    if (data.quest.fortuneGauge != null) store.setFortuneGauge(data.quest.fortuneGauge);
    if (data.quest.points != null) store.addPoints(data.quest.points - store.points);
    if (data.quest.onboardingComplete) {
      // startQuest49은 onboardingComplete를 true로 설정
      if (!store.onboardingComplete) store.startQuest49();
    }
  }

  // 보조 조력자 복원
  if (data.subGuardians?.length > 0) {
    data.subGuardians.forEach((sub: any) => store.addSubGuardian(sub));
  }

  return true; // 데이터 복원 성공
}

// ── AI 사주 풀이 저장 ──
export async function saveSajuReading(uid: string): Promise<void> {
  const state = useAppStore.getState();
  if (!state.sajuReading) return;

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    sajuReading: {
      sections: state.sajuReading.sections,
      summary: state.sajuReading.summary,
      generatedAt: state.sajuReading.generatedAt,
      cacheKey: state.sajuReading.cacheKey,
    },
  });
}
