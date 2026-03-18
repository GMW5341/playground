"use client";

import { useState, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import PromptInput from "@/components/PromptInput";
import PreviewPanel from "@/components/PreviewPanel";
import ChatThread from "@/components/ChatThread";
import type { PrototypeResult, ChatMessage, Experiment } from "@/types";

export default function PlaygroundPage() {
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean | null>(null); // null = 확인 중
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<PrototypeResult | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 마운트 시 API 키 설정 여부 확인
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setApiKeyConfigured(data.configured))
      .catch(() => setApiKeyConfigured(false));
  }, []);

  const handleApiKeyComplete = useCallback(() => {
    setApiKeyConfigured(true);
  }, []);

  const handleApiKeyReset = useCallback(() => {
    setApiKeyConfigured(false);
  }, []);

  const handleGenerate = useCallback(
    async (prompt: string) => {
      setIsLoading(true);
      setError(null);

      const userMessage: ChatMessage = { role: "user", content: prompt };
      setConversationHistory((prev) => [...prev, userMessage]);

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, conversationHistory }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "생성에 실패했습니다.");
        }

        const result: PrototypeResult = await response.json();
        setCurrentResult(result);
        setConversationHistory(result.conversationHistory);

        if (conversationHistory.length === 0) {
          setExperiments((prev) => [
            {
              id: result.id,
              title: prompt.slice(0, 40),
              result,
              createdAt: result.createdAt,
            },
            ...prev,
          ]);
        } else {
          setExperiments((prev) =>
            prev.map((exp, i) => (i === 0 ? { ...exp, result } : exp))
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
        setConversationHistory((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [conversationHistory]
  );

  const handleNewExperiment = useCallback(() => {
    setCurrentResult(null);
    setConversationHistory([]);
    setError(null);
  }, []);

  const handleSelectExperiment = useCallback((exp: Experiment) => {
    setCurrentResult(exp.result);
    setConversationHistory(exp.result.conversationHistory);
    setError(null);
  }, []);

  // 로딩 중 (API 키 상태 확인)
  if (apiKeyConfigured === null) {
    return (
      <>
        <Header apiKeyConfigured={false} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">로딩 중...</p>
        </div>
      </>
    );
  }

  // API 키 미설정
  if (!apiKeyConfigured) {
    return (
      <>
        <Header apiKeyConfigured={false} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">API 키가 설정되지 않았습니다</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Vercel 대시보드에서 <code className="bg-surface-100 px-1.5 py-0.5 rounded text-xs font-mono">ANTHROPIC_API_KEY</code> 환경변수를 설정해주세요.
            </p>
            <div className="card p-4 text-left text-sm space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <p className="text-gray-600">Vercel 대시보드 &rarr; Settings &rarr; Environment Variables</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <p className="text-gray-600">Key: <code className="bg-surface-100 px-1 rounded text-xs font-mono">ANTHROPIC_API_KEY</code></p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <p className="text-gray-600">Value: Anthropic API 키 (sk-ant-...)</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <p className="text-gray-600">저장 후 Redeploy</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 메인 UI
  return (
    <>
      <Header
        apiKeyConfigured={true}
        onApiKeyReset={handleApiKeyReset}
      />
      <div className="flex-1 flex min-h-0">
        {/* 좌측: 실험 목록 사이드바 */}
        <div className="w-64 border-r border-surface-200 bg-white flex flex-col shrink-0">
          <div className="p-3 border-b border-surface-200">
            <button
              onClick={handleNewExperiment}
              className="w-full btn-primary text-sm"
            >
              + 새 실험
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {experiments.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                아직 실험 이력이 없습니다
              </p>
            ) : (
              experiments.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => handleSelectExperiment(exp)}
                  className={`w-full text-left p-2.5 rounded-lg text-sm transition-colors ${
                    currentResult?.id === exp.id
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-surface-50"
                  }`}
                >
                  <p className="font-medium truncate">{exp.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(exp.createdAt).toLocaleString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 우측: 메인 영역 */}
        <div className="flex-1 flex min-w-0">
          {currentResult ? (
            <>
              {/* 대화 + 입력 */}
              <div className="w-[380px] border-r border-surface-200 flex flex-col shrink-0">
                <div className="flex-1 overflow-y-auto p-4">
                  <ChatThread
                    messages={conversationHistory}
                    isLoading={isLoading}
                  />
                </div>
                {error && (
                  <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                    {error}
                  </div>
                )}
                <div className="p-4 border-t border-surface-200 bg-white">
                  <PromptInput
                    onSubmit={handleGenerate}
                    isLoading={isLoading}
                    hasConversation={conversationHistory.length > 0}
                  />
                </div>
              </div>

              {/* 미리보기 */}
              <div className="flex-1 min-w-0">
                <PreviewPanel result={currentResult} />
              </div>
            </>
          ) : (
            /* 빈 상태: 초기 화면 */
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="max-w-lg text-center">
                <div className="text-6xl mb-6 text-gray-200">&#9998;</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  SaaS 프로토타입 시험장
                </h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  자연어로 원하는 기능을 설명하면 Claude가 실제 작동하는 UI를 생성합니다.
                  <br />
                  생성 후 &quot;차트 색상 바꿔줘&quot; 같은 수정 지시로 반복 개선할 수 있습니다.
                </p>

                <div className="card p-6 text-left">
                  <PromptInput
                    onSubmit={handleGenerate}
                    isLoading={isLoading}
                    hasConversation={false}
                  />
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="mt-8 grid grid-cols-3 gap-4 text-left">
                  <div className="p-4 bg-surface-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-700">1. 설명</p>
                    <p className="text-xs text-gray-400 mt-1">
                      &quot;대시보드 만들어줘&quot; 같이 자연어로 입력
                    </p>
                  </div>
                  <div className="p-4 bg-surface-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-700">2. 확인</p>
                    <p className="text-xs text-gray-400 mt-1">
                      실시간 미리보기로 UI와 코드 확인
                    </p>
                  </div>
                  <div className="p-4 bg-surface-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-700">3. 수정</p>
                    <p className="text-xs text-gray-400 mt-1">
                      &quot;여기에 차트 추가&quot;로 반복 개선
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
