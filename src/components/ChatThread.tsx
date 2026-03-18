"use client";

import type { ChatMessage } from "@/types";

interface ChatThreadProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export default function ChatThread({ messages, isLoading }: ChatThreadProps) {
  // 대화가 없으면 안내 표시
  if (messages.length === 0 && !isLoading) {
    return null;
  }

  // 표시용 메시지: user 메시지와 assistant 요약만 보여줌
  const displayMessages = messages.map((msg) => {
    if (msg.role === "assistant") {
      // assistant 응답에서 코드블록 이전의 요약만 추출
      const firstCodeBlock = msg.content.indexOf("```");
      const summary =
        firstCodeBlock > 0
          ? msg.content.slice(0, firstCodeBlock).trim()
          : msg.content.slice(0, 200).trim();
      return { ...msg, content: summary };
    }
    return msg;
  });

  return (
    <div className="space-y-3 mb-4">
      {displayMessages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary-600 text-white rounded-br-md"
                : "bg-surface-100 text-gray-700 rounded-bl-md"
            }`}
          >
            {msg.role === "assistant" && (
              <span className="text-xs font-medium text-primary-600 block mb-1">
                Claude
              </span>
            )}
            {msg.content}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-surface-100 text-gray-500 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm">
            <span className="text-xs font-medium text-primary-600 block mb-1">
              Claude
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
              UI를 생성하고 있습니다...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
