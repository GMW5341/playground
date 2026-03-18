export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GeneratedAPI {
  method: string;
  path: string;
  description: string;
  requestBody?: string;
  responseBody?: string;
}

export interface PrototypeResult {
  id: string;
  preview: string; // 완전한 HTML 문서 (iframe srcDoc용)
  code: string; // Claude가 생성한 원본 HTML 코드
  apis: GeneratedAPI[];
  summary: string; // Claude의 응답 요약
  conversationHistory: ChatMessage[];
  status: "generating" | "ready" | "error";
  error?: string;
  createdAt: string;
}

export interface Experiment {
  id: string;
  title: string; // 첫 프롬프트 기반 제목
  result: PrototypeResult;
  createdAt: string;
}
