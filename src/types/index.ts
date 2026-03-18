// Claude API 멀티모달 콘텐츠 블록
export interface TextContent {
  type: "text";
  text: string;
}

export interface ImageContent {
  type: "image";
  source: {
    type: "base64";
    media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    data: string;
  };
}

export interface DocumentContent {
  type: "document";
  source: {
    type: "base64";
    media_type: "application/pdf";
    data: string;
  };
}

export type ContentBlock = TextContent | ImageContent | DocumentContent;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

// 파일 업로드
export interface UploadedFile {
  name: string;
  type: string;       // MIME type
  size: number;
  dataUrl?: string;    // base64 data URL (클라이언트 미리보기용)
}

export interface GeneratedAPI {
  method: string;
  path: string;
  description: string;
  requestBody?: string;
  responseBody?: string;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  timestamp: string;
}

export interface ExperimentUsage {
  experimentId: string;
  calls: TokenUsage[];
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
}

export interface UsageSummary {
  experiments: ExperimentUsage[];
  allTimeInputTokens: number;
  allTimeOutputTokens: number;
  allTimeCostUsd: number;
}

// SSE 스트리밍 이벤트
export type StreamEvent =
  | { type: "start"; id: string }
  | { type: "text_delta"; content: string }
  | { type: "complete"; summary: string; html: string; apis: GeneratedAPI[]; usage: TokenUsage; conversationHistory: ChatMessage[] }
  | { type: "error"; message: string };

export interface PrototypeResult {
  id: string;
  preview: string;
  code: string;
  apis: GeneratedAPI[];
  summary: string;
  conversationHistory: ChatMessage[];
  status: "generating" | "ready" | "error";
  error?: string;
  createdAt: string;
  usage?: TokenUsage;
}

export interface Experiment {
  id: string;
  title: string;
  result: PrototypeResult;
  createdAt: string;
}
