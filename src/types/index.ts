// 프로토타입 시험장의 핵심 타입 정의

export interface FeatureRequest {
  id: string;
  prompt: string;
  createdAt: string;
  category: "ui" | "api" | "fullstack";
}

export interface GeneratedComponent {
  name: string;
  code: string;
  language: "tsx" | "ts" | "css";
  description: string;
}

export interface GeneratedAPI {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  requestBody?: string;
  responseBody: string;
  code: string;
}

export interface PrototypeResult {
  id: string;
  request: FeatureRequest;
  components: GeneratedComponent[];
  apis: GeneratedAPI[];
  preview: string; // rendered HTML string for iframe preview
  status: "generating" | "ready" | "error";
  error?: string;
  createdAt: string;
}

export interface ExperimentHistory {
  id: string;
  title: string;
  results: PrototypeResult[];
  createdAt: string;
  updatedAt: string;
}
