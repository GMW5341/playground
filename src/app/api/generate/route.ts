import { NextResponse } from "next/server";
import { generateWithClaude } from "@/lib/prototype-engine";
import type { ChatMessage } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, conversationHistory = [] } = body as {
      prompt: string;
      conversationHistory: ChatMessage[];
    };

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "프롬프트를 입력해주세요." },
        { status: 400 }
      );
    }

    // 새 사용자 메시지를 대화 이력에 추가
    const messages: ChatMessage[] = [
      ...conversationHistory,
      { role: "user", content: prompt.trim() },
    ];

    const { summary, html, apis, updatedHistory, usage } =
      await generateWithClaude(messages);

    if (!html) {
      return NextResponse.json(
        { error: "UI 생성에 실패했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: `proto_${Date.now()}`,
      preview: html,
      code: html,
      apis,
      summary,
      conversationHistory: updatedHistory,
      status: "ready",
      createdAt: new Date().toISOString(),
      usage,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "프로토타입 생성 중 오류가 발생했습니다.";
    console.error("Generation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
