"use client";

import { useState, useRef, useEffect } from "react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  hasConversation: boolean; // 기존 대화가 있는지 여부
}

const EXAMPLE_PROMPTS = [
  "고객 관리 대시보드에 매출 차트와 고객 테이블을 만들어줘",
  "SaaS 구독 요금제 선택 페이지를 디자인해줘",
  "프로젝트 관리 칸반보드를 만들어줘",
  "사용자 분석 대시보드 with 그래프와 KPI 카드",
];

export default function PromptInput({
  onSubmit,
  isLoading,
  hasConversation,
}: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 자동 높이 조절
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, [prompt]);

  const handleSubmit = () => {
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
      setPrompt("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      {/* 예시 프롬프트 (대화 없을 때만) */}
      {!hasConversation && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((example, i) => (
            <button
              key={i}
              onClick={() => setPrompt(example)}
              className="text-xs px-3 py-1.5 bg-surface-100 hover:bg-surface-200 text-gray-600 rounded-full transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      )}

      {/* 입력 바 */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasConversation
                ? "수정 사항을 입력하세요... (예: '차트 색상을 파란색으로 바꿔줘')"
                : "만들고 싶은 SaaS 기능을 자연어로 설명하세요..."
            }
            className="w-full px-4 py-3 border border-surface-300 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm min-h-[48px] max-h-[120px]"
            rows={1}
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!prompt.trim() || isLoading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm h-[48px] px-5 flex items-center gap-2 shrink-0"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              생성중
            </>
          ) : hasConversation ? (
            "수정하기"
          ) : (
            "생성하기"
          )}
        </button>
      </div>
      {hasConversation && (
        <p className="text-xs text-gray-400">
          이전 결과를 기반으로 수정됩니다. Enter로 전송, Shift+Enter로 줄바꿈
        </p>
      )}
    </div>
  );
}
