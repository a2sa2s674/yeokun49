# 역운49 프로젝트 현황

> 최종 업데이트: 2026-02-24

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | Expo SDK 54 + React Native 0.81.5 |
| 라우팅 | Expo Router 6 (파일 기반) |
| 상태관리 | Zustand v5 + persist (localStorage) |
| 인증 | Firebase Auth (Google OAuth + 카카오 커스텀 토큰) |
| 백엔드 | Firebase Cloud Functions 1st gen (서울 리전) |
| DB | Firestore (데이터 동기화용) |
| AI | Google Gemini API (2.5-pro / 2.5-flash fallback) |
| 배포 | GitHub Pages (웹), GitHub Actions CI/CD |
| 기타 | react-native-reanimated, expo-linear-gradient, lunar-javascript |

---

## 앱 플로우

```
스플래시 (app/index.tsx, 2.5초 애니메이션)
  │
  ├─ userId 없음 → 로그인 화면 /(auth)/login
  │                   ├─ Google 로그인
  │                   └─ 카카오 로그인
  │                        │
  │                        ├─ Firestore 기존 데이터 있음 → /(tabs)/dashboard
  │                        └─ 데이터 없음 → /(onboarding)/scan
  │
  ├─ userId + 온보딩 미완료 → /(onboarding)/scan
  │                              → /guardian (수호신 선택)
  │                              → /result (결과 확인)
  │                              → /(tabs)/dashboard
  │
  └─ userId + 온보딩 완료 → /(tabs)/dashboard
```

---

## 화면별 구현 현황

### 인증 (auth)

| 화면 | 파일 | 상태 | 비고 |
|------|------|------|------|
| 로그인/가입 | `app/(auth)/login.tsx` | ✅ UI 완료 | Google/카카오 버튼, 크리스탈 장식, 에러 처리 |
| Google OAuth | `src/services/auth.ts` | ⚠️ 코드 완료, 키 미설정 | `GOOGLE_WEB_CLIENT_ID` 플레이스홀더 |
| 카카오 OAuth | `src/services/auth.ts` | ⚠️ 코드 완료, 키 미설정 | `KAKAO_REST_API_KEY` 플레이스홀더 |
| 카카오 Cloud Function | `functions/src/index.ts` | ✅ 배포 완료 | `verifyKakaoToken` 서울 리전 |

### 온보딩 (onboarding)

| 화면 | 파일 | 상태 | 비고 |
|------|------|------|------|
| 생시 입력 (스캔) | `app/(onboarding)/scan.tsx` | ✅ 구현 완료 | 이름, 생년월일, 생시, 성별 입력 → 만세력 계산 |
| 수호신 선택 | `app/(onboarding)/guardian.tsx` | ✅ 구현 완료 | 5대 수호신 카드 선택 |
| 결과 확인 | `app/(onboarding)/result.tsx` | ✅ 구현 완료 | 오행 레이더 차트 + AI 사주 풀이 + 재분석 유료 안내 |

### 메인 탭 (tabs) — 5개 표시 + 2개 히든

| 탭 | 파일 | 상태 | 비고 |
|----|------|------|------|
| 🏠 로비 (대시보드) | `app/(tabs)/dashboard.tsx` | ✅ 구현 완료 | D-Day 카운터, 오행 차트, AI 풀이, 일일 경고, 퀘스트 요약, 보조 조력자 |
| 📄 퀘스트 | `app/(tabs)/quest.tsx` | ✅ 구현 완료 | 길/흉 게이지, 기본 미션 2개, 특별 미션 1개 (사진 인증) |
| 👥 조력자 | `app/(tabs)/helpers.tsx` | ❌ 플레이스홀더 | "조력자" 텍스트만 표시 |
| 🛒 상점 | `app/(tabs)/store.tsx` | ❌ 플레이스홀더 | "인앱 상점" 텍스트만 표시 |
| ⚙️ 설정 | `app/(tabs)/settings.tsx` | ✅ 구현 완료 | 프로필 헤더, 49일 진행도, 수호신, 오행 차트, AI 풀이 재분석 유료 안내, 로그아웃 |
| 🔮 사주 (히든) | `app/(tabs)/saju.tsx` | ❌ 플레이스홀더 | "사주 정보" 텍스트만 표시 |
| 💬 채팅 (히든) | `app/(tabs)/chat.tsx` | ✅ 구현 완료 | AI 수호신 채팅 UI, 무료 3회 제한, 프리미엄 유도 잠금 화면 |

### 서비스 레이어

| 서비스 | 파일 | 상태 | 비고 |
|--------|------|------|------|
| Firebase 초기화 | `src/services/firebase.ts` | ✅ 완료 | JS SDK 모듈러 (web + native 호환) |
| 인증 서비스 | `src/services/auth.ts` | ⚠️ 코드 완료, 키 미설정 | signInWithGoogle, signInWithKakao, signOut |
| Firestore 동기화 | `src/services/firestore.ts` | ✅ 코드 완료 | saveUserProfile, loadUserProfile, saveSajuReading |
| Gemini AI | `src/services/gemini.ts` | ✅ 작동 확인 | 60초 타임아웃, Cloud Function 경유 |
| 알림 | `src/services/notification.ts` | ❌ 스켈레톤 | FCM 미연동 |
| 인앱 결제 | `src/services/purchase.ts` | ⚠️ SKU + 헬퍼 완료 | RevenueCat SKU 정의, PREMIUM_BENEFITS, POINT_PACKAGES, checkPremiumStatus 구현. API 키 미설정 |

### Cloud Functions (Firebase)

| 함수 | 상태 | 비고 |
|------|------|------|
| `generateSajuReading` | ✅ 배포 + 작동 | Gemini 2.5-pro, fallback 2.5-flash, 120초 타임아웃 |
| `verifyKakaoToken` | ✅ 배포 완료 | 카카오 인가 코드 → Firebase 커스텀 토큰, 30초 타임아웃 |

### 컴포넌트

| 컴포넌트 | 파일 | 상태 |
|----------|------|------|
| 오행 레이더 차트 | `src/components/OhangRadarChart.tsx` | ✅ 완료 |

---

## 해결된 주요 버그

| # | 문제 | 원인 | 해결 |
|---|------|------|------|
| 1 | JSON 파싱 오류 (position 147) | Gemini thinking 모델 + `responseMimeType` 충돌 | `responseMimeType` 제거 + `extractJsonFromText()` 추가 |
| 2 | 503 Service Unavailable | Gemini 2.5-flash 일시적 과부하 | fallback 모델 체인 도입 |
| 3 | 웹에서 로그아웃 무반응 | `Alert.alert`은 네이티브 전용 | `Platform.OS === 'web'` → `window.confirm()` 분기 |
| 4 | AI 풀이 로딩 후 사라짐 | 15초 AbortController 타임아웃 초과 | 타임아웃 60초로 확대 |
| 5 | AI API 중복 호출 | React StrictMode + useEffect 중복 실행 | dependency `[]` + `aiCalledRef` 추가 |
| 6 | 길/흉 게이지 반대 방향 | 마커 위치 계산 오류 `value/100` | `(100-value)/100`으로 수정 |
| 7 | `import.meta` SyntaxError | GitHub Pages 빌드 호환성 | post-build 패치 스크립트 (`scripts/patch-importmeta.js`) |

---

## Phase 1: 소셜 로그인 완성 + BM Phase 1

> **목표:** Google/카카오 로그인 설정 완료 + 무료 체험 제한/프리미엄 전환 유도

### ✅ 완료된 작업 (BM Phase 1)

| # | 작업 | 파일 | 상태 |
|---|------|------|------|
| BM-1 | RevenueCat SKU 재구성 (프리미엄 패스 5,900원/월 + 소모성 + 포인트 패키지) | `src/services/purchase.ts` | ✅ |
| BM-2 | Zustand에 isPremium, chatUsedCount, sajuReadingCount 상태 추가 | `src/store/useAppStore.ts` | ✅ |
| BM-3 | 프리미엄 구독자 포인트 1.5배 로직 | `src/store/useAppStore.ts` | ✅ |
| BM-4 | AI 채팅 무료 3회 제한 + 프리미엄 유도 잠금 화면 | `app/(tabs)/chat.tsx` | ✅ |
| BM-5 | AI 사주 풀이 무료 1회 제한 + 재분석 유료 안내 | `app/(onboarding)/result.tsx` | ✅ |
| BM-6 | 마이페이지 AI 풀이 카드 재분석 유료 안내 | `app/(tabs)/settings.tsx` | ✅ |
| BM-7 | 운명 재스캔 시 유료 AI 풀이 경고 메시지 | `app/(tabs)/settings.tsx` | ✅ |

### 해야 할 일 (소셜 로그인 설정)

| # | 작업 | 위치 | 우선순위 |
|---|------|------|---------|
| 1-1 | Firebase Console → Authentication 활성화 | Firebase Console | 🔴 필수 |
| 1-2 | Firebase Console → Google 로그인 제공자 활성화 | Firebase Console | 🔴 필수 |
| 1-3 | Google Cloud Console → OAuth 2.0 클라이언트 ID 생성 | Google Cloud Console | 🔴 필수 |
| 1-4 | `src/services/auth.ts`의 `GOOGLE_WEB_CLIENT_ID` 실제 값으로 교체 | 코드 | 🔴 필수 |
| 1-5 | Kakao Developers → 앱 생성 + REST API 키 발급 | developers.kakao.com | 🔴 필수 |
| 1-6 | `src/services/auth.ts`의 `KAKAO_REST_API_KEY` 실제 값으로 교체 | 코드 | 🔴 필수 |
| 1-7 | `functions/.env`의 `KAKAO_REST_API_KEY` 실제 값으로 교체 + 재배포 | 코드 + Firebase | 🔴 필수 |
| 1-8 | Kakao 리다이렉트 URI 등록 (yeokun49 scheme) | Kakao Console | 🔴 필수 |
| 1-9 | Firebase Console → Firestore 데이터베이스 생성 | Firebase Console | 🔴 필수 |
| 1-10 | Firestore 보안 규칙 작성 (인증된 사용자만 자기 문서 접근) | Firebase Console | 🟡 중요 |
| 1-11 | 로그인 → 온보딩 → 대시보드 전체 플로우 테스트 | 테스트 | 🔴 필수 |

---

## Phase 2: 미구현 탭 화면 구현

> **목표:** 플레이스홀더 상태인 탭 화면들을 실제 기능으로 완성

| # | 작업 | 파일 | 우선순위 |
|---|------|------|---------|
| 2-1 | 조력자 탭 — 메인 수호신 + 보조 수호신 관리 UI | `app/(tabs)/helpers.tsx` | 🔴 높음 |
| 2-2 | 상점 탭 — 인앱 상품 목록 + 결제 연동 (RevenueCat) | `app/(tabs)/store.tsx` | 🟡 중간 |
| 2-3 | 사주 탭 (히든) — 상세 사주 풀이 보기 | `app/(tabs)/saju.tsx` | 🟡 중간 |
| ~~2-4~~ | ~~채팅 탭 (히든) — AI 수호신 채팅 기능~~ | `app/(tabs)/chat.tsx` | ✅ UI 완료 (Cloud Function 연동 TODO) |

---

## Phase 3: 핵심 게임 로직 고도화

> **목표:** 49일 퀘스트 사이클, 일일 데이터, Firestore 연동

| # | 작업 | 비고 | 우선순위 |
|---|------|------|---------|
| 3-1 | 일일 퀘스트 자동 생성 (오행 기반) | 현재 mockDailyData에서 하드코딩됨 → AI 또는 규칙 기반 생성 | 🔴 높음 |
| 3-2 | 일일 경고/축복 자동 생성 | 만세력 + 오행 분석 기반 DailyWarning | 🔴 높음 |
| 3-3 | 49일 사이클 관리 | dayIndex 자동 증가, 완료 시 리셋/리워드 | 🔴 높음 |
| 3-4 | Firestore 실시간 동기화 | 퀘스트 완료, 포인트, 게이지 등 변경 시 즉시 저장 | 🟡 중간 |
| 3-5 | 길/흉 게이지 정교화 | 미완료 퀘스트 시 페널티, 일일 리셋 등 규칙 | 🟡 중간 |
| 3-6 | 보조 조력자 시스템 | 획득/관리/버프 효과 구현 | 🟡 중간 |

---

## Phase 4: 스토어 출시 준비

> **목표:** Google Play Store 출시에 필요한 요소 완성

| # | 작업 | 비고 | 우선순위 |
|---|------|------|---------|
| 4-1 | EAS Build 설정 (Android APK/AAB) | `eas.json` 생성, Expo Application Services | 🔴 필수 |
| 4-2 | 앱 아이콘 + 스플래시 이미지 교체 | 현재 기본값 사용 중 | 🔴 필수 |
| 4-3 | 인앱 결제 연동 (RevenueCat) | `src/services/purchase.ts` 구현 | 🟡 중간 |
| 4-4 | 푸시 알림 연동 (FCM) | `src/services/notification.ts` 구현 | 🟡 중간 |
| 4-5 | 이용약관 / 개인정보 처리방침 페이지 | 로그인 화면 하단 링크 연결 | 🔴 필수 |
| 4-6 | Google Play Console 등록 + 스토어 등록 정보 | 스크린샷, 설명, 카테고리 등 | 🔴 필수 |
| 4-7 | Android 네이티브 테스트 (실기기) | Expo Go 또는 dev client | 🔴 필수 |

---

## Phase 5: 고도화 + iOS

> **목표:** 앱 품질 향상 및 iOS 출시

| # | 작업 | 비고 | 우선순위 |
|---|------|------|---------|
| 5-1 | iOS 빌드 설정 (EAS) | Apple Developer 계정 필요 | 🟡 중간 |
| 5-2 | Apple 로그인 추가 (iOS 필수) | App Store 정책상 소셜 로그인 시 Apple 로그인 필수 | 🟡 중간 |
| 5-3 | 다크모드 지원 | 현재 라이트 모드만 지원 | 🟢 낮음 |
| 5-4 | 오프라인 모드 대응 | 네트워크 없을 때 캐시 데이터로 동작 | 🟢 낮음 |
| 5-5 | 성능 최적화 | 번들 사이즈, 렌더링 최적화 | 🟢 낮음 |
| 5-6 | 접근성 (a11y) 개선 | 스크린 리더, 폰트 크기 대응 | 🟢 낮음 |
| 5-7 | 다국어 지원 (i18n) | 한국어 외 영어 등 | 🟢 낮음 |

---

## 프로젝트 파일 구조

```
yeokun49/
├── app/
│   ├── _layout.tsx              # 루트 레이아웃 (SafeArea, StatusBar)
│   ├── index.tsx                # 스플래시 애니메이션 + 라우팅 분기
│   ├── (auth)/
│   │   ├── _layout.tsx          # 인증 스택 레이아웃
│   │   └── login.tsx            # 로그인 화면 (Google/카카오)
│   ├── (onboarding)/
│   │   ├── _layout.tsx          # 온보딩 스택 레이아웃
│   │   ├── scan.tsx             # 생시 입력
│   │   ├── guardian.tsx         # 수호신 선택
│   │   └── result.tsx           # 결과 확인
│   └── (tabs)/
│       ├── _layout.tsx          # 탭 네비게이션
│       ├── dashboard.tsx        # 🏠 로비
│       ├── quest.tsx            # 📄 퀘스트
│       ├── helpers.tsx          # 👥 조력자 (플레이스홀더)
│       ├── store.tsx            # 🛒 상점 (플레이스홀더)
│       ├── settings.tsx         # ⚙️ 설정
│       ├── saju.tsx             # 🔮 사주 (히든, 플레이스홀더)
│       └── chat.tsx             # 💬 채팅 (무료 3회 제한 + 프리미엄 유도)
├── src/
│   ├── components/
│   │   └── OhangRadarChart.tsx  # 오행 레이더 차트
│   ├── data/
│   │   ├── guardians.ts         # 수호신 데이터
│   │   └── mockDailyData.ts     # 일일 퀘스트 목 데이터
│   ├── lib/
│   │   └── saju.ts              # 만세력 사주 계산 로직
│   ├── services/
│   │   ├── firebase.ts          # Firebase 초기화
│   │   ├── auth.ts              # 인증 (Google/카카오)
│   │   ├── firestore.ts         # Firestore 동기화
│   │   ├── gemini.ts            # Gemini AI 호출
│   │   ├── notification.ts      # 푸시 알림 (스켈레톤)
│   │   └── purchase.ts          # 인앱 결제 (SKU + 헬퍼 완료, API 키 미설정)
│   ├── store/
│   │   ├── index.ts             # 스토어 export
│   │   └── useAppStore.ts       # Zustand 글로벌 스토어
│   ├── styles/
│   │   └── tokens.ts            # 디자인 토큰 (색상, 폰트, 간격)
│   └── types/
│       └── index.ts             # TypeScript 타입 정의
├── functions/
│   ├── src/
│   │   └── index.ts             # Cloud Functions (AI풀이 + 카카오 인증)
│   ├── .env                     # 환경변수 (GEMINI_API_KEY, KAKAO_REST_API_KEY)
│   └── package.json
├── scripts/
│   └── patch-importmeta.js      # import.meta 빌드 패치
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions 배포
├── package.json
└── tsconfig.json
```

---

## 진행률 요약

| 영역 | 진행률 | 상태 |
|------|--------|------|
| 스플래시 + 온보딩 플로우 | 100% | ✅ 완성 |
| 로그인 UI + 인증 코드 | 90% | ⚠️ API 키 설정 필요 |
| 대시보드 (로비) | 100% | ✅ 완성 |
| 퀘스트 탭 | 80% | ⚠️ 데이터가 목 데이터, 동적 생성 미구현 |
| 채팅 탭 | 90% | ✅ UI + 무료 3회 제한 + 프리미엄 유도 (Cloud Function 연동 TODO) |
| 조력자 탭 | 5% | ❌ 플레이스홀더 |
| 상점 탭 | 5% | ❌ 플레이스홀더 |
| 설정 (마이페이지) | 100% | ✅ 완성 (AI 재분석 유료 안내 포함) |
| AI 사주 풀이 | 100% | ✅ Cloud Function + Gemini 작동 + 유료 제한 |
| 인앱 결제 (RevenueCat) | 40% | ⚠️ SKU/헬퍼 완료, API 키 미설정, 스토어 미등록 |
| BM Phase 1 (무료 제한) | 100% | ✅ 채팅 3회, AI 풀이 1회, 프리미엄 1.5배 포인트 |
| Firestore 동기화 | 70% | ⚠️ 코드 완료, DB 생성 + 규칙 미설정 |
| 스토어 출시 준비 | 0% | ❌ 미착수 |
