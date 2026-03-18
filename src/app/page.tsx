"use client";

import { useState, useCallback } from "react";
import PromptInput from "@/components/PromptInput";
import PreviewPanel from "@/components/PreviewPanel";
import HistorySidebar from "@/components/HistorySidebar";
import type { PrototypeResult } from "@/types";

export default function PlaygroundPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<PrototypeResult | null>(null);
  const [history, setHistory] = useState<PrototypeResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "생성에 실패했습니다.");
      }

      const result: PrototypeResult = await response.json();
      setCurrentResult(result);
      setHistory((prev) => [result, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectHistory = useCallback((result: PrototypeResult) => {
    setCurrentResult(result);
    setError(null);
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    setCurrentResult(null);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* 헤더 영역 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">프로토타입 시험장</h2>
        <p className="text-gray-500 mt-1">
          자연어로 SaaS 기능을 설명하면 UI 컴포넌트와 API 스펙이 즉시 생성됩니다.
        </p>
      </div>

      {/* 프롬프트 입력 */}
      <div className="card p-6 mb-8">
        <PromptInput onSubmit={handleGenerate} isLoading={isLoading} />
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 메인 콘텐츠: 결과 + 사이드바 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 프리뷰 패널 (3/4) */}
        <div className="lg:col-span-3">
          {currentResult ? (
            <PreviewPanel result={currentResult} />
          ) : (
            <div className="card p-12 text-center">
              <div className="text-gray-300 text-6xl mb-4">&#9881;</div>
              <h3 className="text-lg font-medium text-gray-500">시험 결과가 여기에 표시됩니다</h3>
              <p className="text-sm text-gray-400 mt-2">
                위 입력창에 원하는 기능을 자연어로 설명하고 &quot;생성하기&quot;를 눌러보세요.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 max-w-xl mx-auto">
                <div className="p-3 bg-surface-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600">1단계</p>
                  <p className="text-xs text-gray-400 mt-1">자연어로 기능 설명</p>
                </div>
                <div className="p-3 bg-surface-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600">2단계</p>
                  <p className="text-xs text-gray-400 mt-1">UI + API 자동 생성</p>
                </div>
                <div className="p-3 bg-surface-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600">3단계</p>
                  <p className="text-xs text-gray-400 mt-1">미리보기로 즉시 확인</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 실험 이력 사이드바 (1/4) */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <HistorySidebar
              history={history}
              selectedId={currentResult?.id ?? null}
              onSelect={handleSelectHistory}
              onClear={handleClearHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
