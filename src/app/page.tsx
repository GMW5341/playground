"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Header from "@/components/Header";
import ApiKeySetup from "@/components/ApiKeySetup";
import PromptInput from "@/components/PromptInput";
import PreviewPanel from "@/components/PreviewPanel";
import ChatThread from "@/components/ChatThread";
import type { PrototypeResult, ChatMessage, Experiment, UsageSummary } from "@/types";

export default function PlaygroundPage() {
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<PrototypeResult | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [currentExpId, setCurrentExpId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const conversationRef = useRef(conversationHistory);
  conversationRef.current = conversationHistory;

  // 마운트 시 API 키 + 실험 이력 + 사용량 로드
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setApiKeyConfigured(data.configured))
      .catch(() => setApiKeyConfigured(false));

    fetch("/api/experiments")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setExperiments(data);
      })
      .catch(() => {});

    fetch("/api/usage")
      .then((res) => res.json())
      .then(setUsageSummary)
      .catch(() => {});
  }, []);

  // 실험을 서버에 저장하는 헬퍼
  const persistExperiment = useCallback((exp: Experiment) => {
    fetch("/api/experiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exp),
    }).catch(() => {});
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

      const history = conversationRef.current;
      const userMessage: ChatMessage = { role: "user", content: prompt };
      setConversationHistory((prev) => [...prev, userMessage]);

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, conversationHistory: history }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "생성에 실패했습니다.");
        }

        const result: PrototypeResult = await response.json();
        setCurrentResult(result);
        setConversationHistory(result.conversationHistory);

        // 새 실험 or 기존 실험 업데이트
        if (history.length === 0) {
          const exp: Experiment = {
            id: result.id,
            title: prompt.slice(0, 40),
            result,
            createdAt: result.createdAt,
          };
          setExperiments((prev) => [exp, ...prev]);
          setCurrentExpId(result.id);
          persistExperiment(exp);

          // 사용량 기록
          if (result.usage) {
            fetch("/api/usage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ experimentId: result.id, usage: result.usage }),
            })
              .then((res) => res.json())
              .then(setUsageSummary)
              .catch(() => {});
          }
        } else if (currentExpId) {
          setExperiments((prev) =>
            prev.map((exp) => {
              if (exp.id === currentExpId) {
                const updated = { ...exp, result };
                persistExperiment(updated);
                return updated;
              }
              return exp;
            })
          );

          // 사용량 기록
          if (result.usage) {
            fetch("/api/usage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ experimentId: currentExpId, usage: result.usage }),
            })
              .then((res) => res.json())
              .then(setUsageSummary)
              .catch(() => {});
          }
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
    [currentExpId, persistExperiment]
  );

  const handleNewExperiment = useCallback(() => {
    setCurrentResult(null);
    setConversationHistory([]);
    setCurrentExpId(null);
    setError(null);
  }, []);

  const handleSelectExperiment = useCallback((exp: Experiment) => {
    setCurrentResult(exp.result);
    setConversationHistory(exp.result.conversationHistory);
    setCurrentExpId(exp.id);
    setError(null);
  }, []);

  const handleDeleteExperiment = useCallback(
    (id: string) => {
      setExperiments((prev) => prev.filter((e) => e.id !== id));
      if (currentExpId === id) {
        setCurrentResult(null);
        setConversationHistory([]);
        setCurrentExpId(null);
      }
      fetch("/api/experiments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).catch(() => {});

      // 사용량도 함께 삭제
      fetch("/api/usage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experimentId: id }),
      })
        .then(() => fetch("/api/usage").then((r) => r.json()).then(setUsageSummary))
        .catch(() => {});
    },
    [currentExpId]
  );

  // 로딩 중
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
        <ApiKeySetup onComplete={handleApiKeyComplete} />
      </>
    );
  }

  return (
    <>
      <Header apiKeyConfigured={true} onApiKeyReset={handleApiKeyReset} usageSummary={usageSummary} />
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
                <div
                  key={exp.id}
                  className={`group flex items-center gap-1 rounded-lg transition-colors ${
                    currentExpId === exp.id
                      ? "bg-primary-50"
                      : "hover:bg-surface-50"
                  }`}
                >
                  <button
                    onClick={() => handleSelectExperiment(exp)}
                    className={`flex-1 text-left p-2.5 text-sm min-w-0 ${
                      currentExpId === exp.id
                        ? "text-primary-700"
                        : "text-gray-600"
                    }`}
                  >
                    <p className="font-medium truncate">{exp.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                      <span>
                        {new Date(exp.createdAt).toLocaleString("ko-KR", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {(() => {
                        const eu = usageSummary?.experiments.find((u) => u.experimentId === exp.id);
                        return eu ? (
                          <span className="text-gray-300">
                            {(eu.totalInputTokens + eu.totalOutputTokens).toLocaleString("ko-KR")}t
                          </span>
                        ) : null;
                      })()}
                    </p>
                  </button>
                  <button
                    onClick={() => handleDeleteExperiment(exp.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all shrink-0"
                    title="삭제"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
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
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="max-w-lg text-center">
                <div className="text-6xl mb-6 text-gray-200">&#9998;</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  SaaS 프로토타입 시험장
                </h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  자연어로 원하는 기능을 설명하면 Claude Opus가 Figma 수준의 UI를 생성합니다.
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
                      &quot;칸반보드 만들어줘&quot; 같이 자연어로 입력
                    </p>
                  </div>
                  <div className="p-4 bg-surface-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-700">2. 확인</p>
                    <p className="text-xs text-gray-400 mt-1">
                      실시간 미리보기로 인터랙티브 UI 확인
                    </p>
                  </div>
                  <div className="p-4 bg-surface-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-700">3. 수정</p>
                    <p className="text-xs text-gray-400 mt-1">
                      &quot;드래그 기능 추가&quot;로 반복 개선
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
