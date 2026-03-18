import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, GeneratedAPI, TokenUsage } from "@/types";
import { getApiKey } from "@/lib/api-key-store";

const SYSTEM_PROMPT = `당신은 세계 최고 수준의 UI/UX 디자이너이자 프론트엔드 개발자입니다.
Figma에서 디자인한 것처럼 정교하고, 실제 프로덕션에 바로 쓸 수 있는 수준의 웹 UI를 생성합니다.

## 디자인 원칙

1. **시각적 완성도**: Figma/Dribbble에서 볼 수 있는 수준의 모던 디자인
   - 미묘한 그라데이션, 부드러운 그림자 (shadow-sm ~ shadow-xl 활용)
   - 카드 기반 레이아웃, 적절한 라운드 코너 (rounded-lg ~ rounded-2xl)
   - 일관된 색상 체계 (primary, secondary, accent 색상 사용)
   - 아이콘은 SVG inline으로 직접 구현 (Heroicons/Lucide 스타일)
   - 여백과 타이포그래피에 신경 쓸 것 (text-xs ~ text-4xl 계층)

2. **인터랙션**: 단순 정적 UI가 아닌, 실제 작동하는 인터랙티브 프로토타입
   - 탭 전환, 사이드바 토글, 모달 열기/닫기
   - 테이블 정렬, 필터, 검색 기능
   - 폼 유효성 검사, 스텝 위자드
   - 드래그앤드롭 (칸반보드 등)
   - 호버 효과, 트랜지션 애니메이션 (transition-all, hover:scale 등)
   - 토스트 알림, 확인 다이얼로그

3. **차트와 데이터 시각화**: SVG로 직접 구현
   - 바 차트, 라인 차트, 도넛/파이 차트, 영역 차트
   - 축, 레이블, 범례, 툴팁 포함
   - 애니메이션 효과 (CSS animation 활용)
   - 현실적인 데이터로 의미 있는 시각화

4. **복잡한 레이아웃**: 실제 SaaS 앱 수준
   - 사이드바 네비게이션 + 헤더 + 메인 콘텐츠
   - 다단 레이아웃 (grid, flexbox)
   - 반응형 브레이크포인트 (모바일 ~ 데스크톱)
   - 중첩된 컴포넌트 구조

5. **한국어 UI**: 모든 텍스트 한국어, 현실적인 샘플 데이터
   - 한국 기업명, 한국 이름, 원화 금액
   - 한국 날짜 형식 (YYYY.MM.DD)

## 기술 규칙

1. 완전한 HTML 문서를 생성 (<!DOCTYPE html> ~ </html>)
2. Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
3. 커스텀 Tailwind 설정이 필요하면 <script>tailwind.config={...}</script> 사용
4. 모든 인터랙션은 vanilla JavaScript로 구현 (외부 라이브러리 금지)
5. CSS 애니메이션은 <style> 태그에 @keyframes로 정의
6. 아이콘은 SVG inline으로 (외부 아이콘 라이브러리 CDN 금지)

## 응답 형식

1. 1-2문장으로 무엇을 만들었는지 요약
2. HTML 코드를 \`\`\`html 코드블록으로 감싸기
3. 백엔드 API가 필요하면 \`\`\`json 코드블록으로 API 스펙 추가:
   [{"method": "GET", "path": "/api/...", "description": "...", "requestBody": "...", "responseBody": "..."}]

## 수정 요청 시

- 이전 HTML 전체를 수정된 버전으로 다시 출력 (전체 코드)
- 변경 사항을 요약에서 설명`;

function parseResponse(text: string): {
  summary: string;
  html: string;
  apis: GeneratedAPI[];
} {
  const firstCodeBlock = text.indexOf("```");
  const summary = firstCodeBlock > 0
    ? text.slice(0, firstCodeBlock).trim()
    : text.slice(0, 300).trim();

  // HTML 코드블록 추출 - 더 관대한 매칭
  const htmlMatch = text.match(/```html\s*\n?([\s\S]*?)```/);
  const html = htmlMatch ? htmlMatch[1].trim() : "";

  const apis: GeneratedAPI[] = [];
  const jsonMatch = text.match(/```json\s*\n?([\s\S]*?)```/);
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
  usage: TokenUsage;
}> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error(
      "API 키가 설정되지 않았습니다. 설정에서 Anthropic API 키를 입력해주세요."
    );
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-opus-4-20250514",
    max_tokens: 16384,
    system: SYSTEM_PROMPT,
    messages: conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  });

  const assistantText =
    response.content[0].type === "text" ? response.content[0].text : "";

  const { summary, html, apis } = parseResponse(assistantText);

  const usage: TokenUsage = {
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    estimatedCostUsd:
      (response.usage.input_tokens / 1_000_000) * 15 +
      (response.usage.output_tokens / 1_000_000) * 75,
    timestamp: new Date().toISOString(),
  };

  const updatedHistory: ChatMessage[] = [
    ...conversationHistory,
    { role: "assistant", content: assistantText },
  ];

  return { summary, html, apis, updatedHistory, usage };
}
