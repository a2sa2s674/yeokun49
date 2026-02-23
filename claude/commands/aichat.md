# 에이전트 4: AI 채팅 & 조력자 페르소나 담당 (AI-Chat)

## 전제 조건
Frontend + CoreLogic 에이전트 완료 후 실행.
시작 전에 반드시 확인:
- `src/types/index.ts` 읽기
- `src/screens/ChatScreen` 확인 (Frontend가 만든 UI)
- `src/hooks/useUserProfile.ts` 확인 (사용자 프로필 읽기)
- `agent-logs/frontend.md`, `agent-logs/corelogic.md` 읽기

## 너의 역할
조력자 캐릭터별 페르소나 프롬프트 설계 + Firebase Functions를 통한 OpenAI 연동.
Frontend의 채팅 UI에 실제 AI 응답을 연결해.

## 담당 파일 범위
```
src/chat/
  ├── personas.ts          ← 캐릭터별 시스템 프롬프트
  ├── chatService.ts       ← Firebase Functions 호출
  └── useChat.ts           ← 채팅 훅 (Frontend가 import)
functions/
  └── chat.ts              ← OpenAI API 호출 Cloud Function
```

---

## 구현할 모듈

### MODULE 1: 캐릭터 페르소나 (`src/chat/personas.ts`)

각 조력자별 시스템 프롬프트를 작성해. 한국어로, 실제 역술가처럼 말하되 캐릭터 개성 반영.

```ts
export const PERSONAS: Record<string, string> = {
  청명: `
    너는 '청명'이야. 수(水)의 기운을 가진 지혜의 여신.
    말투: 고요하고 심오하게, 가끔 수수께끼 같은 표현 사용.
    예: "물이 바위를 뚫듯, 꾸준함이 운명을 바꾼다오."
    역할: 사용자의 사주와 오늘 퀘스트를 바탕으로 조언.
    절대 하지 않는 것: 부정적 예언, 불안 조성.
    항상 포함: 오늘 수행할 퀘스트 관련 격려.
  `,
  적화: `
    너는 '적화'야. 화(火)의 기운을 가진 열정의 전사.
    말투: 직설적이고 열정적, 짧고 강렬한 문장 선호.
    예: "망설임은 적이다! 오늘 바로 행동하라!"
    ...
  `,
  황토: `너는 '황토'야. 토(土)의 기운을 가진 대지의 수호자. 따뜻하고 포용적인 말투...`,
  백호: `너는 '백호'야. 금(金)의 기운을 가진 결단의 신수. 날카롭고 명확한 말투...`,
  청룡: `너는 '청룡'이야. 목(木)의 기운을 가진 성장의 수호령. 희망차고 성장 지향적 말투...`,
}
```

### MODULE 2: Firebase Cloud Function (`functions/chat.ts`)

```ts
export const chatWithGuardian = functions.https.onCall(async (data, context) => {
  // 인증 확인
  // data: { guardianId, message, userProfile, chatHistory }
  // OpenAI API 호출 (gpt-4o-mini 사용, 비용 절감)
  // 시스템 프롬프트 = PERSONAS[guardianId] + 사주 컨텍스트 주입
  // 응답 반환
})
```

**사주 컨텍스트 주입 형식:**
```
사용자 정보:
- 이름: {name}
- 가장 부족한 기운: {weakestElement}
- 오늘 퀘스트 완료: {completedCount}/3
- 49일 중 {dayIndex}번째 날

위 정보를 바탕으로 조력자 캐릭터로서 대화해.
```

### MODULE 3: 채팅 서비스 (`src/chat/chatService.ts`)

```ts
export async function sendMessage(params: {
  guardianId: string
  message: string
  userProfile: UserProfile
  chatHistory: ChatMessage[]
}): Promise<string>
```

- `functions().httpsCallable('chatWithGuardian')` 호출
- 응답 타임아웃: 15초
- 에러 시: "조력자와의 연결이 끊겼습니다. 다시 시도해 주세요."

### MODULE 4: 채팅 훅 (`src/chat/useChat.ts`)

```ts
export function useChat(guardianId: string) {
  return {
    messages: ChatMessage[],
    sendMessage: (text: string) => Promise<void>,
    isLoading: boolean,
    error: string | null,
    clearHistory: () => void,
  }
}
```

- Zustand 또는 로컬 state로 채팅 이력 관리
- Firestore `/users/{uid}/chatHistory/{guardianId}/messages`에 저장
- `isAiChatUnlimited` false 시 → 일일 5회 제한 (CoreLogic의 `usePurchase` 참조)

---

## 무료/유료 제한 로직
```ts
// 무료: 하루 5회
// 유료(ai_chat_unlimited): 무제한
if (!isAiChatUnlimited && dailyCount >= 5) {
  // "오늘의 교감 횟수를 모두 사용했어요. 무제한 교감을 원하시면 상점을 방문해 주세요."
  // → 상점 이동 버튼 표시
}
```

---

## 완료 기준
- 채팅 화면에서 조력자에게 메시지 전송 → AI 응답 수신 작동
- 캐릭터별 말투가 확연히 구분될 것
- 무료/유료 제한 로직 작동
- `agent-logs/aichat.md`에 완료 내용 기록
