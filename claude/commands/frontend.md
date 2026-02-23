# 에이전트 2: 프론트엔드 & UI 애니메이션 개발자 (Frontend)

## 전제 조건
Architect 에이전트가 완료된 후 실행. 시작 전에 반드시 확인:
- `src/types/index.ts` 읽기
- `src/styles/tokens.ts` 읽기
- `agent-logs/architect.md` 읽기

## 너의 역할
React Native UI 컴포넌트, 화면 레이아웃, 애니메이션, 차트를 담당해.
비즈니스 로직은 CoreLogic이 만든 훅을 import해서 사용하고, **UI만 책임져**.

## 담당 파일 범위
```
src/components/        ← 재사용 컴포넌트
src/screens/           ← 화면별 UI
app/(onboarding)/      ← 온보딩 화면
app/(tabs)/            ← 탭 화면 UI 부분
```

## 절대 건드리지 않는 것
- `src/lib/`, `src/hooks/`, `src/store/` (CoreLogic 담당)
- `src/services/` (Architect 담당)

---

## 디자인 시스템 (반드시 준수)
```
배경:       #0F0F1A (앱), #1A1A2E (카드)
포인트:     #6B21A8 (보라), #0D9488 (청록)
텍스트:     #F1F0F5 (기본), #9CA3AF (보조)
폰트:       Noto Serif KR (제목/강조), Noto Sans KR (본문)
테마:       동양 오컬트 + 한국 전통 신수
효과:       별빛 글로우, 그라디언트, 반투명 카드(glassmorphism)
```
모든 색상/간격은 `src/styles/tokens.ts`의 `Colors`, `Spacing` 사용.

---

## 구현할 화면 및 컴포넌트

### [컴포넌트] OhangRadarChart (`src/components/OhangRadarChart.tsx`)
- `victory-native`의 `VictoryRadar` 사용
- 5축: 목/화/토/금/수
- 각 축 색상은 `Colors.ohang` 적용
- Props: `stats: OhangStats`

### [컴포넌트] QuestCard (`src/components/QuestCard.tsx`)
- 오행 아이콘(색깔 원) + 퀘스트 제목 + 설명
- 체크박스 (완료 시 취소선 + 글로우 효과)
- Props: `quest: Quest`, `onComplete: (id: string) => void`

### [컴포넌트] GuardianCard (`src/components/GuardianCard.tsx`)
- 캐릭터 이미지 또는 Lottie 애니메이션
- 이름, 오행 기운 뱃지, 설명
- 선택 시 보라색 글로우 테두리
- Props: `guardian: Guardian`, `selected: boolean`, `onSelect: () => void`

### [컴포넌트] LuckGaugeBar (`src/components/LuckGaugeBar.tsx`)
- 오늘의 길흉 점수(0~100)를 시각화
- 좌: 흉(빨강) ~ 우: 길(금색) 그라디언트 바
- 점수 위에 작은 삼각형 포인터
- Props: `score: number`

### [컴포넌트] DayCounter (`src/components/DayCounter.tsx`)
- "D-{n}" 큰 텍스트 + "운명의 {n}번째 날" 서브텍스트
- Props: `dayIndex: number`

---

### [화면] 스플래시 & 온보딩 (`app/index.tsx`)
- "역운49" 로고 + 별빛 파티클 애니메이션 (Reanimated)
- 1.5초 후 스캔 화면으로 자동 이동
- 배경: 짙은 남색 그라디언트

### [화면] 운명 스캔 폼 (`app/(onboarding)/scan.tsx`)
- 이름 입력 (TextInput)
- 생년월일: DateTimePicker
- 태어난 시간: 시진 Picker (자시/축시/... 12개, "모름" 포함)
- 양력/음력 토글 (커스텀 스위치)
- "운명 스캔 시작" 버튼 → CoreLogic의 `useOhangCalculator` 훅 호출
- 로딩 중: "사주를 분석하는 중..." + 오행 심볼 회전 애니메이션

### [화면] 오행 스탯 결과 (`src/screens/ResultScreen.tsx`)
- 상단: "당신의 운명 스탯" 제목
- 중앙: OhangRadarChart 컴포넌트
- 하단: 오행별 점수 카드 (강점 2개 초록, 약점 1개 빨강 하이라이트)
- "당신의 부족한 기운: {weakestElement}({%})" 강조 텍스트
- "조력자를 선택하세요" CTA 버튼

### [화면] 조력자 선택 (`app/(onboarding)/guardian.tsx`)
- GuardianCard 5장 스크롤 (FlatList 가로 스크롤)
- 부족한 오행 조력자 자동 추천 (뱃지: "추천")
- 선택 후 "교감 시작" 버튼 → 대시보드 이동
- Lottie 애니메이션: 선택한 캐릭터가 날아오르는 효과

### [화면] 메인 대시보드 (`app/(tabs)/dashboard.tsx`)
- 상단: DayCounter + 사용자 이름 인사
- 중앙: 조력자 캐릭터 Lottie (둥둥 떠다니는 루프 애니메이션)
- LuckGaugeBar (오늘의 길흉 점수)
- "오늘의 퀘스트" 섹션 → QuestCard 3개
- 하단 여백: 탭 바 높이만큼

### [화면] 인앱 상점 (`app/(tabs)/store.tsx`)
- 상품 카드 3종:
  - 프리미엄 조력자 패키지 (₩9,900)
  - 디지털 부적 (₩2,900)
  - AI 채팅 무제한 (₩4,900/월)
- 각 카드: 상품 이미지 + 이름 + 설명 + 가격 + 구매 버튼
- 구매 버튼 → CoreLogic의 `usePurchase` 훅 호출
- 하단: "구매 복원" 텍스트 링크

### [화면] 조력자 채팅 (`app/(tabs)/chat.tsx`)
- 상단: 조력자 아바타 + 이름
- 채팅 버블 (FlatList, 역방향)
  - 사용자: 오른쪽, 보라 배경
  - 조력자: 왼쪽, 반투명 어두운 배경 + 아바타
- "조력자가 점을 치는 중..." 타이핑 인디케이터 (점 3개 애니메이션)
- 하단: TextInput + 전송 버튼

---

## 완료 기준
- 모든 화면이 더미 데이터로 렌더링될 것
- TypeScript 타입 에러 없을 것
- `agent-logs/frontend.md`에 완료 화면 목록 기록
