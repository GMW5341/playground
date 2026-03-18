import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, GeneratedAPI } from "@/types";

const SYSTEM_PROMPT = `당신은 B2B SaaS UI/UX 전문 개발자입니다. 사용자의 자연어 설명을 바탕으로 실제 작동하는 웹 UI를 생성합니다.

규칙:
1. 반드시 완전한 HTML 문서를 생성하세요 (<!DOCTYPE html>부터 </html>까지)
2. Tailwind CSS CDN을 사용하세요: <script src="https://cdn.tailwindcss.com"></script>
3. 인터랙티브 요소(탭 전환, 모달, 드롭다운, 정렬, 필터 등)는 vanilla JavaScript로 구현하세요
4. 한국어 UI를 기본으로 사용하세요
5. 모던하고 깔끔한 B2B SaaS 스타일로 디자인하세요 (그림자, 라운드 코너, 적절한 여백)
6. 차트/그래프가 필요하면 SVG나 CSS로 시각적으로 구현하세요 (외부 라이브러리 사용 금지)
7. 현실적인 한국어 샘플 데이터를 포함하여 실제 사용 모습을 보여주세요
8. 반응형 디자인을 적용하세요

응답 형식:
- 먼저 1-2문장으로 무엇을 만들었는지 요약하세요
- HTML 코드를 \`\`\`html 코드블록으로 감싸세요
- 이 UI에 필요한 백엔드 API가 있다면, \`\`\`json 코드블록으로 API 스펙을 추가하세요. 형식:
  [{"method": "GET", "path": "/api/...", "description": "...", "requestBody": "...", "responseBody": "..."}]

수정 요청 시:
- 이전에 생성한 HTML 전체를 수정된 버전으로 다시 출력하세요 (부분 수정이 아닌 전체 코드)
- 변경된 부분을 요약에서 설명하세요`;

function parseResponse(text: string): {
  summary: string;
  html: string;
  apis: GeneratedAPI[];
} {
  // 요약 추출: 첫 번째 코드블록 이전의 텍스트
  const firstCodeBlock = text.indexOf("```");
  const summary = firstCodeBlock > 0
    ? text.slice(0, firstCodeBlock).trim()
    : text.slice(0, 200).trim();

  // HTML 코드블록 추출
  const htmlMatch = text.match(/```html\s*\n([\s\S]*?)```/);
  const html = htmlMatch ? htmlMatch[1].trim() : "";

  // API 스펙 JSON 추출
  const apis: GeneratedAPI[] = [];
  const jsonMatch = text.match(/```json\s*\n([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim());
      if (Array.isArray(parsed)) {
        apis.push(...parsed);
      }
    } catch {
      // JSON 파싱 실패 시 무시
    }
  }

  return { summary, html, apis };
}

export async function generateWithClaude(
  conversationHistory: ChatMessage[]
): Promise<{
  summary: string;
  html: string;
  apis: GeneratedAPI[];
  updatedHistory: ChatMessage[];
}> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY가 설정되지 않았습니다. .env 파일에 API 키를 추가해주세요."
    );
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  });

  const assistantText =
    response.content[0].type === "text" ? response.content[0].text : "";

  const { summary, html, apis } = parseResponse(assistantText);

  const updatedHistory: ChatMessage[] = [
    ...conversationHistory,
    { role: "assistant", content: assistantText },
  ];

  return { summary, html, apis, updatedHistory };
}
