import { GeneratedComponent, GeneratedAPI, PrototypeResult, FeatureRequest } from "@/types";

/**
 * 프로토타입 생성 엔진
 *
 * 실제 프로덕션에서는 LLM API (Claude, GPT 등)를 호출하여
 * 자연어 → 코드 변환을 수행합니다.
 *
 * 현재는 데모/시험용으로 템플릿 기반 생성기를 제공합니다.
 * .env에 ANTHROPIC_API_KEY를 설정하면 실제 AI 생성으로 전환됩니다.
 */

// 자연어 프롬프트에서 키워드를 분석하여 카테고리 추론
export function analyzePrompt(prompt: string): {
  category: "ui" | "api" | "fullstack";
  keywords: string[];
  features: string[];
} {
  const lower = prompt.toLowerCase();

  const uiKeywords = ["대시보드", "차트", "테이블", "폼", "버튼", "모달", "카드", "리스트", "그래프", "UI", "화면", "페이지", "디자인", "레이아웃"];
  const apiKeywords = ["API", "엔드포인트", "CRUD", "데이터", "DB", "스키마", "인증", "로그인", "권한", "REST"];

  const matchedUI = uiKeywords.filter((k) => lower.includes(k.toLowerCase()));
  const matchedAPI = apiKeywords.filter((k) => lower.includes(k.toLowerCase()));

  let category: "ui" | "api" | "fullstack" = "fullstack";
  if (matchedUI.length > 0 && matchedAPI.length === 0) category = "ui";
  if (matchedAPI.length > 0 && matchedUI.length === 0) category = "api";

  return {
    category,
    keywords: [...matchedUI, ...matchedAPI],
    features: extractFeatures(prompt),
  };
}

function extractFeatures(prompt: string): string[] {
  const features: string[] = [];
  const patterns = [
    /(.+?)\s*기능/g,
    /(.+?)\s*추가/g,
    /(.+?)\s*만들어/g,
    /(.+?)\s*구현/g,
    /(.+?)\s*보여/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(prompt)) !== null) {
      const feature = match[1].trim();
      if (feature.length > 1 && feature.length < 30) {
        features.push(feature);
      }
    }
  }

  return features.length > 0 ? features : [prompt.slice(0, 50)];
}

// 데모용 UI 컴포넌트 생성 템플릿
const UI_TEMPLATES: Record<string, (prompt: string) => GeneratedComponent> = {
  대시보드: (prompt) => ({
    name: "Dashboard",
    language: "tsx",
    description: `프롬프트 기반 대시보드: ${prompt.slice(0, 50)}`,
    code: `export default function Dashboard() {
  const stats = [
    { label: "총 매출", value: "₩12,450,000", change: "+12.5%" },
    { label: "신규 고객", value: "284", change: "+8.2%" },
    { label: "활성 사용자", value: "1,429", change: "+3.1%" },
    { label: "이탈률", value: "2.4%", change: "-0.8%" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">대시보드</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border p-5 shadow-sm">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <p className={\`text-sm mt-1 \${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}\`}>
              {stat.change} vs 지난달
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-5 shadow-sm h-64 flex items-center justify-center text-gray-400">
          📊 매출 추이 차트 영역
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm h-64 flex items-center justify-center text-gray-400">
          📈 사용자 증가 그래프 영역
        </div>
      </div>
    </div>
  );
}`,
  }),
  테이블: (prompt) => ({
    name: "DataTable",
    language: "tsx",
    description: `프롬프트 기반 데이터 테이블: ${prompt.slice(0, 50)}`,
    code: `export default function DataTable() {
  const data = [
    { id: 1, name: "A사", plan: "Enterprise", mrr: "₩2,500,000", status: "활성" },
    { id: 2, name: "B사", plan: "Pro", mrr: "₩800,000", status: "활성" },
    { id: 3, name: "C사", plan: "Starter", mrr: "₩200,000", status: "체험중" },
    { id: 4, name: "D사", plan: "Enterprise", mrr: "₩3,100,000", status: "활성" },
    { id: 5, name: "E사", plan: "Pro", mrr: "₩600,000", status: "해지예정" },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">고객 관리</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ 고객 추가</button>
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">ID</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">회사명</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">플랜</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">MRR</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">상태</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{row.id}</td>
                <td className="px-4 py-3 text-sm font-medium">{row.name}</td>
                <td className="px-4 py-3 text-sm">{row.plan}</td>
                <td className="px-4 py-3 text-sm">{row.mrr}</td>
                <td className="px-4 py-3">
                  <span className={\`text-xs px-2 py-1 rounded-full \${
                    row.status === "활성" ? "bg-green-100 text-green-700" :
                    row.status === "체험중" ? "bg-blue-100 text-blue-700" :
                    "bg-red-100 text-red-700"
                  }\`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`,
  }),
  폼: (prompt) => ({
    name: "FormComponent",
    language: "tsx",
    description: `프롬프트 기반 폼: ${prompt.slice(0, 50)}`,
    code: `export default function FormComponent() {
  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6">설정</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">회사명</label>
          <input type="text" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="회사명을 입력하세요" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <input type="email" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="admin@company.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">플랜</label>
          <select className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>Starter</option>
            <option>Pro</option>
            <option>Enterprise</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
          <textarea rows={3} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="추가 설명을 입력하세요" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">저장</button>
      </form>
    </div>
  );
}`,
  }),
};

// 데모용 API 스펙 생성
function generateDemoAPIs(prompt: string): GeneratedAPI[] {
  const lower = prompt.toLowerCase();

  if (lower.includes("인증") || lower.includes("로그인")) {
    return [
      {
        method: "POST",
        path: "/api/auth/login",
        description: "사용자 로그인",
        requestBody: JSON.stringify({ email: "string", password: "string" }, null, 2),
        responseBody: JSON.stringify({ token: "jwt-token", user: { id: 1, email: "user@example.com", role: "admin" } }, null, 2),
        code: `export async function POST(request: Request) {
  const { email, password } = await request.json();
  // 실제 구현시 DB 조회 및 비밀번호 검증
  const token = generateJWT({ email, role: "admin" });
  return Response.json({ token, user: { id: 1, email, role: "admin" } });
}`,
      },
      {
        method: "POST",
        path: "/api/auth/register",
        description: "사용자 회원가입",
        requestBody: JSON.stringify({ email: "string", password: "string", name: "string", company: "string" }, null, 2),
        responseBody: JSON.stringify({ id: 1, email: "user@example.com", name: "홍길동" }, null, 2),
        code: `export async function POST(request: Request) {
  const body = await request.json();
  // 실제 구현시 유효성 검증 및 DB 저장
  return Response.json({ id: 1, ...body }, { status: 201 });
}`,
      },
    ];
  }

  // 기본 CRUD API
  const resource = lower.includes("고객") ? "customers" : lower.includes("제품") ? "products" : "items";
  return [
    {
      method: "GET",
      path: `/api/${resource}`,
      description: `${resource} 목록 조회`,
      responseBody: JSON.stringify({ data: [{ id: 1, name: "샘플" }], total: 1, page: 1 }, null, 2),
      code: `export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  // 실제 구현시 DB 조회
  return Response.json({ data: [], total: 0, page });
}`,
    },
    {
      method: "POST",
      path: `/api/${resource}`,
      description: `${resource} 생성`,
      requestBody: JSON.stringify({ name: "string", description: "string" }, null, 2),
      responseBody: JSON.stringify({ id: 1, name: "새 항목", createdAt: "2026-03-18" }, null, 2),
      code: `export async function POST(request: Request) {
  const body = await request.json();
  // 실제 구현시 유효성 검증 및 DB 저장
  return Response.json({ id: 1, ...body, createdAt: new Date().toISOString() }, { status: 201 });
}`,
    },
    {
      method: "PUT",
      path: `/api/${resource}/:id`,
      description: `${resource} 수정`,
      requestBody: JSON.stringify({ name: "string", description: "string" }, null, 2),
      responseBody: JSON.stringify({ id: 1, name: "수정됨", updatedAt: "2026-03-18" }, null, 2),
      code: `export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  // 실제 구현시 DB 업데이트
  return Response.json({ id: params.id, ...body, updatedAt: new Date().toISOString() });
}`,
    },
    {
      method: "DELETE",
      path: `/api/${resource}/:id`,
      description: `${resource} 삭제`,
      responseBody: JSON.stringify({ success: true }, null, 2),
      code: `export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  // 실제 구현시 DB 삭제
  return Response.json({ success: true });
}`,
    },
  ];
}

// 프리뷰 HTML 생성 (iframe용)
function generatePreviewHTML(components: GeneratedComponent[]): string {
  const componentPreview = components.length > 0
    ? components[0].code
      .replace(/export default function \w+\(\) \{/, "")
      .replace(/\}$/, "")
      .replace(/className=/g, "class=")
    : "<p>생성된 컴포넌트가 없습니다.</p>";

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }</style>
</head>
<body class="bg-gray-50 p-4">
  <div id="preview">${componentPreview}</div>
</body>
</html>`;
}

// 메인 생성 함수
export async function generatePrototype(request: FeatureRequest): Promise<PrototypeResult> {
  const analysis = analyzePrompt(request.prompt);

  const components: GeneratedComponent[] = [];
  const apis: GeneratedAPI[] = [];

  // UI 컴포넌트 생성
  if (analysis.category === "ui" || analysis.category === "fullstack") {
    for (const keyword of analysis.keywords) {
      const templateKey = Object.keys(UI_TEMPLATES).find((k) =>
        keyword.toLowerCase().includes(k.toLowerCase())
      );
      if (templateKey) {
        components.push(UI_TEMPLATES[templateKey](request.prompt));
      }
    }
    // 키워드 매칭 없으면 기본 대시보드 생성
    if (components.length === 0) {
      components.push(UI_TEMPLATES["대시보드"](request.prompt));
    }
  }

  // API 스펙 생성
  if (analysis.category === "api" || analysis.category === "fullstack") {
    apis.push(...generateDemoAPIs(request.prompt));
  }

  const preview = generatePreviewHTML(components);

  return {
    id: `proto_${Date.now()}`,
    request,
    components,
    apis,
    preview,
    status: "ready",
    createdAt: new Date().toISOString(),
  };
}
