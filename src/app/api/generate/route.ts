import { streamGenerateWithClaude } from "@/lib/prototype-engine";
import { parseFiles } from "@/lib/file-parser";
import type { ChatMessage, ContentBlock } from "@/types";

export const maxDuration = 300; // 5분 타임아웃 허용

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let prompt: string;
    let conversationHistory: ChatMessage[] = [];
    let userContent: string | ContentBlock[];

    if (contentType.includes("multipart/form-data")) {
      // 파일 업로드 포함
      const formData = await request.formData();
      prompt = (formData.get("prompt") as string) || "";
      const historyJson = formData.get("conversationHistory") as string;
      if (historyJson) {
        try { conversationHistory = JSON.parse(historyJson); } catch { /* ignore */ }
      }

      const files = formData.getAll("files") as File[];
      if (files.length > 0 && files[0].size > 0) {
        userContent = await parseFiles(formData, prompt);
      } else {
        userContent = prompt.trim();
      }
    } else {
      // JSON 요청 (텍스트만)
      const body = await request.json();
      prompt = body.prompt || "";
      conversationHistory = body.conversationHistory || [];
      userContent = prompt.trim();
    }

    if (
      (!prompt || prompt.trim().length === 0) &&
      (typeof userContent === "string" && userContent.length === 0)
    ) {
      return new Response(
        JSON.stringify({ error: "프롬프트를 입력해주세요." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 새 사용자 메시지를 대화 이력에 추가
    const messages: ChatMessage[] = [
      ...conversationHistory,
      { role: "user", content: userContent },
    ];

    // SSE 스트리밍 응답
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamGenerateWithClaude(messages)) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "스트리밍 오류";
          const errorEvent = `data: ${JSON.stringify({ type: "error", message })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "프로토타입 생성 중 오류가 발생했습니다.";
    console.error("Generation error:", error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
