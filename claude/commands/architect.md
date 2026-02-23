# 에이전트 1: 수석 아키텍트 (Architect)

## 너의 역할
너는 '역운49' 프로젝트의 수석 아키텍트야.
Expo 기반 React Native 프로젝트 초기 세팅, Firebase 연동, RevenueCat 인앱결제 뼈대,
그리고 다른 에이전트들이 참조할 공유 타입/상수를 **가장 먼저** 만들어야 해.

## 담당 파일 범위 (이 파일들만 만지기)
```
app.json / app.config.ts
src/types/index.ts          ← 공유 타입 (CLAUDE.md 내용 기반으로 작성)
src/styles/tokens.ts        ← 색상, 폰트, 간격 디자인 토큰
src/services/firebase.ts    ← Firebase 초기화
src/services/purchase.ts    ← RevenueCat 초기화 및 뼈대
src/services/notification.ts ← FCM 초기화 및 권한 요청
app/_layout.tsx             ← Expo Router 루트 레이아웃
app/(tabs)/_layout.tsx      ← 탭 네비게이션 구조
```

## 절대 건드리지 않는 파일
- `src/screens/` (Frontend 담당)
- `src/lib/`, `src/hooks/`, `src/store/` (CoreLogic 담당)
- `src/chat/`, `functions/` (AI-Chat 담당)

---

## 지금 바로 수행할 작업

### TASK 1: 폴더 구조 생성
다음 구조를 만들어. (빈 index.ts + .gitkeep으로 폴더 생성)
```
yeokun49/
├── app/
│   ├── _layout.tsx              ← 루트 레이아웃, 폰트/Firebase 초기화
│   ├── index.tsx                ← 스플래시 → 온보딩 리다이렉트
│   ├── (onboarding)/
│   │   ├── scan.tsx             ← 운명 스캔 폼
│   │   └── guardian.tsx         ← 조력자 선택
│   └── (tabs)/
│       ├── _layout.tsx          ← 하단 탭 바
│       ├── dashboard.tsx        ← 메인 대시보드
│       ├── saju.tsx             ← 사주 정보
│       ├── chat.tsx             ← 조력자 채팅
│       └── store.tsx            ← 인앱 상점
├── src/
│   ├── types/index.ts
│   ├── styles/tokens.ts
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── purchase.ts
│   │   └── notification.ts
│   ├── screens/                 ← Frontend 담당
│   ├── components/              ← Frontend 담당
│   ├── lib/                     ← CoreLogic 담당
│   ├── hooks/                   ← CoreLogic 담당
│   ├── store/                   ← CoreLogic 담당
│   └── chat/                    ← AI-Chat 담당
├── assets/
│   ├── lottie/                  ← 캐릭터 애니메이션 JSON
│   └── images/
├── functions/                   ← Firebase Cloud Functions
└── CLAUDE.md
```

### TASK 2: 디자인 토큰 (`src/styles/tokens.ts`)
```ts
export const Colors = {
  primary: '#6B21A8',       // 메인 보라
  secondary: '#0D9488',     // 청록
  background: '#0F0F1A',    // 앱 배경
  surface: '#1A1A2E',       // 카드 배경
  text: '#F1F0F5',
  textMuted: '#9CA3AF',
  ohang: {
    목: '#22C55E',
    화: '#EF4444',
    토: '#EAB308',
    금: '#F59E0B',
    수: '#3B82F6',
  }
}
export const Spacing = { xs:4, sm:8, md:16, lg:24, xl:32 }
export const FontSize = { sm:12, md:14, lg:18, xl:24, xxl:32 }
export const Radius = { sm:8, md:12, lg:20, full:999 }
```

### TASK 3: Firebase 초기화 (`src/services/firebase.ts`)
- `@react-native-firebase/app` 기반
- Firestore, FCM export
- 환경변수는 `app.config.ts`의 `extra`에서 읽기

### TASK 4: RevenueCat 초기화 (`src/services/purchase.ts`)
```ts
// 이 파일의 뼈대를 작성해. 실제 API 키는 플레이스홀더로.
import Purchases from 'react-native-purchases'

export const PRODUCT_IDS = {
  premiumGuardian: 'premium_guardian_pack',
  talisman: 'digital_talisman',
  aiChatUnlimited: 'ai_chat_unlimited',
}

export const initPurchases = async () => { /* ... */ }
export const getProducts = async () => { /* ... */ }
export const purchaseProduct = async (productId: string) => { /* ... */ }
export const restorePurchases = async () => { /* ... */ }
```

### TASK 5: FCM 초기화 (`src/services/notification.ts`)
- 권한 요청 함수
- 포그라운드/백그라운드 메시지 핸들러
- 알림 채널 설정 (Android)

### TASK 6: 루트 레이아웃 (`app/_layout.tsx`)
- Expo Font 로드 (Noto Serif KR, Noto Sans KR)
- Firebase 초기화 실행
- RevenueCat 초기화 실행
- FCM 권한 요청
- SafeAreaProvider 감싸기

### TASK 7: 탭 네비게이션 (`app/(tabs)/_layout.tsx`)
- 탭 4개: 대시보드(홈), 사주, 채팅, 상점
- 아이콘: Expo Vector Icons
- 탭 바 배경 Colors.surface, 활성색 Colors.primary

---

## 완료 기준
- `npx expo start` 실행 시 에러 없이 탭 네비게이션 화면이 뜰 것
- 모든 서비스 파일이 import 가능한 상태일 것
- `agent-logs/architect.md`에 완료 파일 목록과 다음 에이전트 주의사항 기록
