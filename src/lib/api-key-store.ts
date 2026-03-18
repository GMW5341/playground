import fs from "fs";
import path from "path";

// 서버 프로세스 내 메모리에 API 키 캐시 (런타임 즉시 사용 가능)
let cachedApiKey: string | null = null;

const ENV_LOCAL_PATH = path.join(process.cwd(), ".env.local");

// .env.local 파일에서 API 키 읽기
function readKeyFromFile(): string | null {
  try {
    if (!fs.existsSync(ENV_LOCAL_PATH)) return null;
    const content = fs.readFileSync(ENV_LOCAL_PATH, "utf-8");
    const match = content.match(/ANTHROPIC_API_KEY=(.+)/);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

// API 키 저장 (.env.local 파일 + 메모리 캐시)
export function saveApiKey(key: string): void {
  cachedApiKey = key;
  fs.writeFileSync(ENV_LOCAL_PATH, `ANTHROPIC_API_KEY=${key}\n`, "utf-8");
}

// API 키 가져오기: 메모리 캐시 → .env.local 파일 → process.env 순서
export function getApiKey(): string | null {
  if (cachedApiKey) return cachedApiKey;

  const fromFile = readKeyFromFile();
  if (fromFile) {
    cachedApiKey = fromFile;
    return fromFile;
  }

  const fromEnv = process.env.ANTHROPIC_API_KEY;
  if (fromEnv && fromEnv !== "your-api-key-here") {
    cachedApiKey = fromEnv;
    return fromEnv;
  }

  return null;
}

// API 키 설정 여부 확인
export function isApiKeyConfigured(): boolean {
  return getApiKey() !== null;
}
