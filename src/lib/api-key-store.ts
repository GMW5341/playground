// API 키를 process.env에서 읽기 (Vercel 환경변수 또는 .env.local)
export function getApiKey(): string | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (key && key !== "your-api-key-here") return key;
  return null;
}

export function isApiKeyConfigured(): boolean {
  return getApiKey() !== null;
}
