"use client";

import { useState } from "react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const EXAMPLE_PROMPTS = [
  "고객 관리 대시보드에 매출 차트와 고객 테이블을 추가해줘",
  "사용자 로그인/회원가입 API를 만들어줘",
  "구독 플랜 선택 폼과 결제 페이지 UI를 보여줘",
  "제품 CRUD API와 관리 테이블을 만들어줘",
];

export default function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="원하는 SaaS 기능을 자연어로 설명해보세요...&#10;예: '고객 관리 대시보드에 매출 차트를 추가해줘'"
          className="w-full h-32 p-4 pr-24 border border-surface-300 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="absolute bottom-4 right-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              생성중...
            </span>
          ) : (
            "생성하기"
          )}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-400">예시:</span>
        {EXAMPLE_PROMPTS.map((example, i) => (
          <button
            key={i}
            onClick={() => setPrompt(example)}
            className="text-xs px-3 py-1.5 bg-surface-100 hover:bg-surface-200 text-gray-600 rounded-full transition-colors"
          >
            {example.length > 30 ? example.slice(0, 30) + "..." : example}
          </button>
        ))}
      </div>
    </div>
  );
}
