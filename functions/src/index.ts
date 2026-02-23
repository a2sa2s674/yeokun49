/**
 * Firebase Cloud Function: generateSajuReading
 * Gemini AI를 사용하여 사주팔자 심층 풀이를 생성합니다.
 */
import * as functions from 'firebase-functions';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

// CORS 설정 (모든 origin 허용 — GitHub Pages 등)
const corsHandler = cors({ origin: true });

// ── 타입 정의 ──────────────────────────────────────

interface SajuReadingRequest {
  pillars: {
    year: string;
    month: string;
    day: string;
    time: string;
  };
  ohang: {
    목: number;
    화: number;
    토: number;
    금: number;
    수: number;
  };
  strongest: string;
  weakest: string;
  gender: '남' | '여';
  name: string;
}

interface SajuReadingSection {
  title: string;
  icon: string;
  content: string;
}

interface SajuReadingResponse {
  sections: SajuReadingSection[];
  summary: string;
  generatedAt: string;
}

// ── 프롬프트 빌더 ──────────────────────────────────

function buildSajuPrompt(data: SajuReadingRequest): string {
  return `당신은 한국 전통 사주팔자(四柱八字) 전문 역술가입니다.
아래 만세력(萬歲曆) 기반 사주 정보를 바탕으로 깊이 있고 따뜻한 운세 풀이를 해주세요.
긍정적이고 격려하는 톤을 유지하되, 주의사항도 부드럽게 언급해주세요.

[사주 정보]
- 이름: ${data.name}
- 성별: ${data.gender}
- 년주(年柱): ${data.pillars.year}
- 월주(月柱): ${data.pillars.month}
- 일주(日柱): ${data.pillars.day}
- 시주(時柱): ${data.pillars.time === '?' ? '미상' : data.pillars.time}
- 오행 비율: 목(木) ${data.ohang.목}%, 화(火) ${data.ohang.화}%, 토(土) ${data.ohang.토}%, 금(金) ${data.ohang.금}%, 수(水) ${data.ohang.수}%
- 가장 강한 오행: ${data.strongest}
- 가장 약한 오행: ${data.weakest}

다음 5가지 섹션으로 나누어 풀이해주세요. 각 섹션은 3~4문장으로 작성하세요.
응답은 반드시 아래 JSON 형식으로만 작성하세요:

{
  "summary": "한 줄 종합 요약 (20자 이내)",
  "sections": [
    { "title": "성격/성향", "icon": "🧬", "content": "성격과 성향에 대한 풀이..." },
    { "title": "재운(財運)", "icon": "💰", "content": "재물운에 대한 풀이..." },
    { "title": "연애운", "icon": "💕", "content": "연애운에 대한 풀이..." },
    { "title": "건강운", "icon": "💪", "content": "건강운에 대한 풀이..." },
    { "title": "49일 조언", "icon": "🔮", "content": "앞으로 49일간의 운세 흐름과 조언..." }
  ]
}

JSON만 출력하세요. 다른 텍스트, 마크다운, 코드블록 기호는 포함하지 마세요.`;
}

// ── Gemini 응답 파싱 ───────────────────────────────

function parseGeminiResponse(text: string): SajuReadingResponse {
  // 마크다운 코드 블록 제거 (혹시 포함된 경우)
  let clean = text.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const parsed = JSON.parse(clean);

  // 응답 구조 검증
  if (!parsed.summary || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
    throw new Error('Invalid response structure from Gemini');
  }

  return {
    summary: parsed.summary,
    sections: parsed.sections.map((s: any) => ({
      title: s.title || '알 수 없음',
      icon: s.icon || '🔮',
      content: s.content || '',
    })),
    generatedAt: new Date().toISOString(),
  };
}

// ── Cloud Function ─────────────────────────────────

export const generateSajuReading = functions
  .region('asia-northeast3') // 서울 리전
  .https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      // POST만 허용
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      try {
        const data = req.body as SajuReadingRequest;

        // 필수 필드 검증
        if (!data.pillars || !data.ohang || !data.strongest || !data.weakest) {
          res.status(400).json({ error: 'Missing required fields: pillars, ohang, strongest, weakest' });
          return;
        }

        // Gemini API 키 가져오기
        const apiKey = functions.config().gemini?.api_key;
        if (!apiKey) {
          console.error('Gemini API key not configured. Run: firebase functions:config:set gemini.api_key="YOUR_KEY"');
          res.status(500).json({ error: 'AI service not configured' });
          return;
        }

        // Gemini 호출
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        });

        const prompt = buildSajuPrompt(data);
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const parsed = parseGeminiResponse(text);

        res.status(200).json(parsed);
      } catch (error: any) {
        console.error('generateSajuReading error:', error?.message || error);
        res.status(500).json({
          error: 'Failed to generate saju reading',
          message: error?.message || 'Unknown error',
        });
      }
    });
  });
