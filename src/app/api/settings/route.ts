import { NextResponse } from "next/server";
import { isApiKeyConfigured, setApiKey } from "@/lib/api-key-store";

export async function GET() {
  return NextResponse.json({ configured: isApiKeyConfigured() });
}

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 10) {
      return NextResponse.json(
        { error: "유효한 API 키를 입력해주세요." },
        { status: 400 }
      );
    }

    setApiKey(apiKey.trim());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json(
      { error: "API 키 저장에 실패했습니다." },
      { status: 500 }
    );
  }
}
