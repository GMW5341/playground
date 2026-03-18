import { NextResponse } from "next/server";
import { isApiKeyConfigured, saveApiKey, getApiKey } from "@/lib/api-key-store";

// API 키 설정 여부 확인 (키 값 자체는 반환하지 않음)
export async function GET() {
  return NextResponse.json({ configured: isApiKeyConfigured() });
}

// API 키 저장
export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 10) {
      return NextResponse.json(
        { error: "유효한 API 키를 입력해주세요." },
        { status: 400 }
      );
    }

    saveApiKey(apiKey.trim());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json(
      { error: "API 키 저장에 실패했습니다." },
      { status: 500 }
    );
  }
}
