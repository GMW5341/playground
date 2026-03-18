// 서버 메모리에 API 키 캐시 (Vercel 호환 - 파일 쓰기 없음)
let cachedApiKey: string | null = null;

export function getApiKey(): string | null {
  // 1순위: 런타임에 UI에서 설정한 키
  if (cachedApiKey) return cachedApiKey;
  // 2순위: 환경변수 (Vercel 대시보드 또는 .env.local)
  const key = process.env.ANTHROPIC_API_KEY;
  if (key && key !== "your-api-key-here") return key;
  return null;
}

export function setApiKey(key: string): void {
  cachedApiKey = key;
}

export function isApiKeyConfigured(): boolean {
  return getApiKey() !== null;
}
