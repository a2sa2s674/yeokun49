# 역운49 (Yeok-un 49) — Claude Code 팀 가이드 (React Native 버전)

## 프로젝트 본질
사주팔자를 '초기 스탯'으로 삼고, 49일 동안 오행(목화토금수) 기반 일일 퀘스트를 수행해
다가오는 액운을 막고 운명을 개척하는 **게이미피케이션 사주 앱**.
Android(Google Play) + iOS(App Store) 동시 출시 목표.

---

## 기술 스택 (고정 — 임의 변경 금지)

| 영역 | 기술 |
|------|------|
| 앱 프레임워크 | React Native + Expo (Managed Workflow) |
| 네비게이션 | Expo Router |
| 상태관리 | Zustand |
| 애니메이션 | Lottie (`lottie-react-native`), Reanimated 3 |
| 차트 | `victory-native` (오행 레이더 차트) |
| 백엔드/DB | Firebase Firestore + Cloud Functions |
| 푸시알림 | `@react-native-firebase/messaging` (FCM) |
| 사주 계산 | `lunar-javascript` |
| 인앱 결제 | `react-native-purchases` (RevenueCat) |
| 스타일 | StyleSheet + 공유 토큰(`src/styles/tokens.ts`) |

---

## 에이전트 팀 구성 및 담당 영역

| 에이전트 | 역할 | 담당 파일/폴더 |
|---------|------|--------------|
| **Architect** | Expo 초기 세팅, Firebase/RevenueCat 연동, 폴더 구조 | `app.json`, `app/`, Firebase 설정, `src/services/` |
| **Frontend** | 화면 컴포넌트, 애니메이션, 차트 UI | `src/screens/`, `src/components/`, `src/styles/` |
| **CoreLogic** | 사주 계산, Firestore 연동, Zustand 스토어, 인앱결제 | `src/lib/`, `src/hooks/`, `src/store/`, `src/services/purchase.ts` |
| **AI-Chat** | 조력자 채팅 프롬프트, OpenAI/Firebase Functions 연동 | `src/chat/`, `functions/` |

---

## 파일 충돌 방지 규칙
1. 각 에이전트는 **자신의 담당 폴더만** 수정한다
2. `src/types/index.ts`와 `src/styles/tokens.ts`는 **Architect가 먼저 작성**, 이후 읽기만 가능
3. 작업 완료 시 `agent-logs/{에이전트명}.md`에 완료 목록 기록
4. 함수 시그니처 변경 시 반드시 이 CLAUDE.md의 **공유 인터페이스** 섹션 업데이트

---

## 에이전트 실행 순서 (의존성)
```
1단계: Architect   → 프로젝트 뼈대, 타입/상수 정의
         ↓
2단계: CoreLogic   → 사주 계산 훅, Zustand 스토어, RevenueCat 서비스
         ↓
3단계: Frontend    → 화면 UI (CoreLogic 훅 참조)
         ↓
4단계: AI-Chat     → 채팅 기능 (Frontend 채팅 화면에 연결)
```

---

## 핵심 도메인 개념 (전 에이전트 필수 숙지)

### 오행 정의
```ts
목(木): 성장/창의, 색상 #22C55E
화(火): 열정/행동, 색상 #EF4444
토(土): 안정/신뢰, 색상 #EAB308
금(金): 결실/의지, 색상 #F59E0B
수(水): 지혜/감성, 색상 #3B82F6
```

### 조력자(수호신) 캐릭터
```
청명 — 수(水) 기운 / 지혜의 여신
적화 — 화(火) 기운 / 열정의 전사
황토 — 토(土) 기운 / 대지의 수호자
백호 — 금(金) 기운 / 결단의 신수
청룡 — 목(木) 기운 / 성장의 수호령
```

### 49일 사이클
온보딩(스캔) → 오행 스탯 계산 → 조력자 선택 → 49일 퀘스트 진행
매일 자정 Firestore에서 오행별 퀘스트 3개 할당 → FCM 알림

### 수익화 모델
- 무료: 기본 사주 풀이, 일일 퀘스트, 조력자 1명
- 유료 상품(RevenueCat):
  - `premium_guardian_pack` — 프리미엄 조력자 캐릭터 패키지
  - `digital_talisman` — 디지털 부적 (행운 부스터)
  - `ai_chat_unlimited` — AI 조력자 무제한 채팅

---

## 공유 인터페이스 (에이전트 간 계약)

```ts
// src/types/index.ts

export type OhangKey = '목' | '화' | '토' | '금' | '수'

export interface OhangStats {
  목: number  // 0~100
  화: number
  토: number
  금: number
  수: number
}

export interface UserProfile {
  uid: string
  name: string
  birthDate: string      // 'YYYY-MM-DD'
  birthTime: string | null  // 'HH:MM', 시간 모르면 null
  isLunar: boolean
  ohang: OhangStats
  weakestElement: OhangKey
  guardianId: string
  questStartDate: string  // ISO 날짜
  dayIndex: number        // 0~48 (49일 중 오늘)
}

export interface Quest {
  id: string
  element: OhangKey
  title: string
  description: string
  difficulty: 1 | 2 | 3
  completed: boolean
  point: number
}

export interface Guardian {
  id: string
  name: string
  element: OhangKey
  description: string
  lottieFile: string  // assets/lottie/{id}.json
  isPremium: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'guardian'
  content: string
  timestamp: number
}
```
