# 에이전트 3: 코어 로직 & 인앱 결제 담당자 (CoreLogic)

## 전제 조건
Architect 에이전트가 완료된 후 실행 (Frontend와 병렬 가능).
시작 전에 반드시 확인:
- `src/types/index.ts` 읽기
- `src/services/firebase.ts` 읽기
- `src/services/purchase.ts` 읽기
- `agent-logs/architect.md` 읽기

## 너의 역할
화면 뒤에서 돌아가는 모든 비즈니스 로직을 담당해.
사주 계산, Firestore 연동, 상태관리, 인앱결제 처리.
Frontend가 import해서 쓸 수 있도록 **훅(Hook) 형태**로 공개해.

## 담당 파일 범위
```
src/lib/           ← 순수 유틸 함수 (오행 계산 등)
src/hooks/         ← React 커스텀 훅
src/store/         ← Zustand 스토어
src/services/purchase.ts  ← RevenueCat 로직 완성 (Architect가 뼈대 작성)
functions/         ← Firebase Cloud Functions
```

---

## 구현할 핵심 모듈

### MODULE 1: 오행 계산 (`src/lib/ohang.ts`)

```ts
import Lunar from 'lunar-javascript'

// 생년월일시 → 사주 8자 → 오행 비율 계산
export function calculateOhang(params: {
  birthDate: string    // 'YYYY-MM-DD'
  birthTime: string | null  // 'HH:MM'
  isLunar: boolean
}): OhangStats

// 가장 부족한 오행 반환
export function getWeakestElement(stats: OhangStats): OhangKey

// 오행 점수 → 오늘의 길흉 점수 (0~100)
export function calculateLuckScore(stats: OhangStats, dayIndex: number): number
```

**구현 방법:**
1. `isLunar`이면 `lunar-javascript`로 음→양 변환
2. 년/월/일/시 각각의 천간(天干)·지지(地支) 추출
3. 천간·지지 각각의 오행 매핑표로 목/화/토/금/수 개수 집계
4. 전체 8자 중 비율(%)로 변환 → `OhangStats` 반환

**오행 매핑표:**
```ts
const GANJIGAN_OHANG = {
  갑: '목', 을: '목',
  병: '화', 정: '화',
  무: '토', 기: '토',
  경: '금', 신: '금',
  임: '수', 계: '수',
  자: '수', 축: '토', 인: '목', 묘: '목',
  진: '토', 사: '화', 오: '화', 미: '토',
  신: '금', 유: '금', 술: '토', 해: '수',
}
```

---

### MODULE 2: 사주 계산 훅 (`src/hooks/useOhangCalculator.ts`)

```ts
export function useOhangCalculator() {
  return {
    calculate: (params) => OhangStats,  // calculateOhang 래핑
    isLoading: boolean,
    error: string | null,
  }
}
```

---

### MODULE 3: Zustand 스토어 (`src/store/userStore.ts`)

```ts
interface UserStore {
  profile: UserProfile | null
  quests: Quest[]
  luckScore: number

  setProfile: (profile: UserProfile) => void
  setQuests: (quests: Quest[]) => void
  completeQuest: (questId: string) => void  // Firestore 업데이트 포함
  clearUser: () => void
}
```

`persist` 미들웨어 적용 (AsyncStorage로 로컬 저장).

---

### MODULE 4: Firestore 연동 훅

#### `src/hooks/useQuests.ts`
```ts
export function useQuests(uid: string, dayIndex: number) {
  return {
    quests: Quest[],
    completeQuest: (id: string) => Promise<void>,
    isLoading: boolean,
  }
}
```

**Firestore 스키마 설계 및 초기 데이터 시드:**
```
/questTemplates/{elementKey}/quests/{questId}
  - id: string
  - element: OhangKey
  - title: string
  - description: string
  - difficulty: 1|2|3
  - point: number

/users/{uid}/dailyQuests/{YYYY-MM-DD}
  - quests: Quest[]  ← 오행별 1개씩 랜덤 3개
  - assignedAt: timestamp
  - completedCount: number
```

**questTemplates 초기 데이터 10개 이상 작성 (실제 한국 전통 퀘스트)**:
- 목(木): "오늘 화분에 물 주기", "공원 산책 30분", "새로운 책 첫 장 읽기"
- 화(火): "감사한 사람에게 연락하기", "좋아하는 음악 크게 듣기"
- 토(土): "방 정리하기", "가족에게 안부 전화"
- 금(金): "오늘 목표 3개 적기", "불필요한 물건 하나 정리"
- 수(水): "명상 10분", "오늘 배운 것 일기 쓰기"

#### `src/hooks/useUserProfile.ts`
```ts
export function useUserProfile(uid: string) {
  return {
    profile: UserProfile | null,
    saveProfile: (profile: UserProfile) => Promise<void>,
    isLoading: boolean,
  }
}
```

---

### MODULE 5: 인앱 결제 훅 (`src/hooks/usePurchase.ts`)

```ts
export function usePurchase() {
  return {
    products: Product[],         // RevenueCat에서 불러온 상품 목록
    purchase: (productId: string) => Promise<boolean>,
    restore: () => Promise<void>,
    isPremiumGuardian: boolean,  // 구매 여부
    isAiChatUnlimited: boolean,
    isLoading: boolean,
    error: string | null,
  }
}
```

**구현 상세:**
- `Purchases.getProducts(Object.values(PRODUCT_IDS))` 로 상품 로드
- 구매 성공 시 `Firestore /users/{uid}/purchases/{productId}` 에 기록
- `Purchases.restorePurchases()` 복원 처리
- 구매 실패/취소 시 사용자 친화적 에러 메시지 반환

---

### MODULE 6: Firebase Cloud Functions (`functions/index.ts`)

```ts
// 매일 자정 실행: 전체 유저에게 퀘스트 할당
export const assignDailyQuests = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Asia/Seoul')
  .onRun(async () => { /* ... */ })

// FCM 푸시: 아침 8시 운세 알림
export const sendMorningNotification = functions.pubsub
  .schedule('0 8 * * *')
  .timeZone('Asia/Seoul')
  .onRun(async () => { /* ... */ })
```

---

## 완료 기준
- `useOhangCalculator` 에 실제 생년월일 입력 시 오행 % 출력 가능
- `useQuests` 가 Firestore에서 퀘스트 읽고 완료 처리 가능
- `usePurchase` 가 RevenueCat 상품 목록 로드 가능 (실제 결제는 스토어 등록 후)
- TypeScript 타입 에러 없을 것
- `agent-logs/corelogic.md`에 완료 모듈 목록과 주요 함수 시그니처 기록
