# 역운49 — Claude Code 실행 가이드

## 📁 이 파일의 목적
Claude Code를 열고 아래 프롬프트들을 **순서대로** 붙여넣으면 됩니다.
각 단계가 끝나면 `agent-logs/` 폴더를 확인 후 다음 단계로 넘어가세요.

---

## STEP 0: 프로젝트 부트스트랩 (터미널에서 먼저 실행)

```bash
npx create-expo-app yeokun49 --template blank-typescript
cd yeokun49

# 필수 패키지 설치
npx expo install \
  expo-router \
  react-native-safe-area-context \
  react-native-screens \
  @react-native-async-storage/async-storage

npm install \
  zustand \
  lunar-javascript \
  lottie-react-native \
  react-native-reanimated \
  victory-native \
  react-native-svg \
  react-native-purchases \
  @react-native-firebase/app \
  @react-native-firebase/firestore \
  @react-native-firebase/messaging \
  @react-native-firebase/functions

# Claude Code 실행
claude
```

---

## STEP 1: Architect 에이전트 실행

Claude Code에 다음을 붙여넣기:

```
CLAUDE.md 파일을 읽어줘. 그 다음 .claude/commands/architect.md를 읽고,
그 안의 지시사항을 모두 수행해줘.

완료 후 agent-logs/architect.md에 생성한 파일 목록을 기록해줘.
```

✅ 완료 확인: `npx expo start` 에러 없이 실행되면 OK

---

## STEP 2: CoreLogic + Frontend 병렬 실행

**터미널 1 (CoreLogic):**
```
CLAUDE.md와 agent-logs/architect.md를 읽어줘.
그 다음 .claude/commands/corelogic.md를 읽고 모든 모듈을 구현해줘.
lunar-javascript를 사용해서 오행 계산이 실제로 동작하게 해줘.
```

**터미널 2 (Frontend) — 동시에:**
```
CLAUDE.md와 agent-logs/architect.md를 읽어줘.
그 다음 .claude/commands/frontend.md를 읽고 모든 화면을 구현해줘.
CoreLogic 훅은 더미 데이터로 대체해서 UI가 먼저 보이게 해줘.
```

✅ 완료 확인: 앱에서 모든 화면 탭 이동 + 더미 데이터 렌더링

---

## STEP 3: CoreLogic ↔ Frontend 연결

```
agent-logs/corelogic.md와 agent-logs/frontend.md를 읽어줘.
Frontend의 더미 데이터를 CoreLogic의 실제 훅으로 교체해줘.

특히:
1. scan.tsx → useOhangCalculator 연결
2. dashboard.tsx → useQuests, useUserProfile 연결
3. store.tsx → usePurchase 연결
```

---

## STEP 4: AI-Chat 에이전트 실행

```
CLAUDE.md, agent-logs/frontend.md, agent-logs/corelogic.md를 읽어줘.
.claude/commands/aichat.md를 읽고 조력자 AI 채팅 기능을 구현해줘.

Firebase Functions는 실제 배포 가능한 코드로 작성하고,
OpenAI API 키는 Firebase Functions 환경변수로 처리해줘.
```

---

## STEP 5: 최종 통합 & 앱스토어 준비

```
전체 앱을 테스트해줘. 다음을 순서대로 확인해:
1. 온보딩 플로우 전체 (스캔 → 결과 → 조력자 선택 → 대시보드)
2. 퀘스트 완료 후 Firestore 반영
3. RevenueCat 상품 로드 (샌드박스 모드)
4. 채팅 기능 (OpenAI 연동)

이슈가 있으면 수정하고 agent-logs/integration.md에 결과를 기록해줘.
```

---

## 앱스토어 출시 체크리스트

### Google Play
- [ ] `eas build --platform android` 빌드
- [ ] RevenueCat Google Play 상품 연결
- [ ] FCM 서버 키 등록
- [ ] 스크린샷 5장 + 아이콘 512px

### App Store
- [ ] Apple Developer 계정 + 앱 ID 등록
- [ ] `eas build --platform ios` 빌드
- [ ] RevenueCat App Store Connect 상품 연결
- [ ] TestFlight 베타 테스트

---

## 예상 개발 타임라인

| 단계 | 소요 시간 |
|------|---------|
| STEP 0-1 (세팅) | 30분 |
| STEP 2 (UI + 로직) | 2~3시간 |
| STEP 3 (연결) | 1시간 |
| STEP 4 (AI 채팅) | 1~2시간 |
| STEP 5 (통합/버그) | 1~2시간 |
| **총합** | **약 6~8시간** |
