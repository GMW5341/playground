import { NextResponse } from "next/server";
import { generatePrototype } from "@/lib/prototype-engine";
import type { FeatureRequest } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "프롬프트를 입력해주세요." },
        { status: 400 }
      );
    }

    const featureRequest: FeatureRequest = {
      id: `req_${Date.now()}`,
      prompt: prompt.trim(),
      createdAt: new Date().toISOString(),
      category: "fullstack",
    };

    const result = await generatePrototype(featureRequest);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "프로토타입 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
