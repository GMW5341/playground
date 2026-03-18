"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types";

interface ChatThreadProps {
  messages: ChatMessage[];
  isLoading: boolean;
  streamingText?: string;
}

export default function ChatThread({ messages, isLoading, streamingText }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // 새 메시지나 스트리밍 시 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streamingText]);

  if (messages.length === 0 && !isLoading) {
    return null;
  }

  // 표시용: assistant 요약만, user는 텍스트 부분만
  const displayMessages = messages.map((msg) => {
    const text = typeof msg.content === "string"
      ? msg.content
      : msg.content
          .filter((b) => b.type === "text")
          .map((b) => (b as { type: "text"; text: string }).text)
          .join("\n");

    if (msg.role === "assistant") {
      const firstCodeBlock = text.indexOf("```");
      const summary = firstCodeBlock > 0
        ? text.slice(0, firstCodeBlock).trim()
        : text.slice(0, 200).trim();
      return { role: msg.role, content: summary };
    }
    return { role: msg.role, content: text };
  });

  // 스트리밍 텍스트에서 요약 부분만 실시간 표시
  const streamingSummary = streamingText
    ? (() => {
        const idx = streamingText.indexOf("```");
        return idx > 0 ? streamingText.slice(0, idx).trim() : streamingText.slice(0, 300);
      })()
    : "";

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

      {/* 스트리밍 중 실시간 텍스트 */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-surface-100 text-gray-700 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm max-w-[80%]">
            <span className="text-xs font-medium text-primary-600 block mb-1">
              Claude
            </span>
            {streamingSummary ? (
              <span>
                {streamingSummary}
                <span className="inline-block w-1.5 h-4 bg-primary-500 ml-0.5 animate-pulse" />
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-gray-500">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
                UI를 생성하고 있습니다...
              </span>
            )}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
