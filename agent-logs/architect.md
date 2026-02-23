# Architect 에이전트 완료 로그

## 생성 파일 목록

### 공유 타입 & 스타일
- `src/types/index.ts` — 공유 타입 (OhangKey, OhangStats, UserProfile, Quest, Guardian, ChatMessage)
- `src/styles/tokens.ts` — 디자인 토큰 (Colors, Spacing, FontSize, Radius)

### 서비스 파일
- `src/services/firebase.ts` — Firebase 초기화 (Firestore, FCM export)
- `src/services/purchase.ts` — RevenueCat 초기화 및 인앱결제 뼈대
- `src/services/notification.ts` — FCM 권한 요청, 포그라운드/백그라운드 핸들러

### 라우팅 & 레이아웃
- `app/_layout.tsx` — 루트 레이아웃 (폰트, Firebase, RevenueCat, FCM 초기화)
- `app/index.tsx` — 스플래시 → 온보딩 리다이렉트
- `app/(onboarding)/_layout.tsx` — 온보딩 Stack 레이아웃
- `app/(onboarding)/scan.tsx` — 운명 스캔 폼 (placeholder)
- `app/(onboarding)/guardian.tsx` — 조력자 선택 (placeholder)
- `app/(tabs)/_layout.tsx` — 하단 탭 네비게이션 (대시보드, 사주, 채팅, 상점)
- `app/(tabs)/dashboard.tsx` — 메인 대시보드 (placeholder)
- `app/(tabs)/saju.tsx` — 사주 정보 (placeholder)
- `app/(tabs)/chat.tsx` — 조력자 채팅 (placeholder)
- `app/(tabs)/store.tsx` — 인앱 상점 (placeholder)

### 설정 파일 수정
- `app.json` — userInterfaceStyle dark, scheme 추가, splash 배경색 변경

### 폴더 구조 (.gitkeep)
- `src/screens/.gitkeep` — Frontend 담당
- `src/components/.gitkeep` — Frontend 담당
- `src/lib/.gitkeep` — CoreLogic 담당
- `src/hooks/.gitkeep` — CoreLogic 담당
- `src/store/.gitkeep` — CoreLogic 담당
- `src/chat/.gitkeep` — AI-Chat 담당
- `assets/lottie/.gitkeep` — 캐릭터 애니메이션
- `assets/images/.gitkeep` — 이미지 리소스
- `assets/fonts/.gitkeep` — 폰트 파일 (Noto Serif KR, Noto Sans KR 필요)
- `functions/.gitkeep` — Firebase Cloud Functions

---

## 다음 에이전트(CoreLogic) 주의사항

1. **폰트 파일 필요**: `assets/fonts/`에 Noto Serif KR, Noto Sans KR 폰트 파일(.otf)을 추가해야 앱이 정상 실행됩니다
2. **Firebase 설정 파일 필요**: `google-services.json` (Android) 및 `GoogleService-Info.plist` (iOS)가 프로젝트에 추가되어야 합니다
3. **RevenueCat API 키**: `src/services/purchase.ts`의 `API_KEYS`에 실제 키를 넣어야 합니다
4. **Firebase 패키지 미설치**: `@react-native-firebase/app`, `@react-native-firebase/firestore`, `@react-native-firebase/messaging`이 아직 `package.json`에 없습니다. Expo Dev Client 또는 prebuild 환경에서 설치 필요
5. **타입 참조**: `src/types/index.ts`의 타입들을 그대로 사용하세요. 변경이 필요하면 CLAUDE.md 공유 인터페이스 섹션도 함께 업데이트하세요
6. **Zustand 스토어**: `src/store/` 디렉토리에 작성하세요. UserProfile, Quest 상태 관리가 필요합니다
