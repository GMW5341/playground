"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Header from "@/components/Header";
import ApiKeySetup from "@/components/ApiKeySetup";
import PromptInput from "@/components/PromptInput";
import PreviewPanel from "@/components/PreviewPanel";
import ChatThread from "@/components/ChatThread";
import type { PrototypeResult, ChatMessage, Experiment, UsageSummary, StreamEvent } from "@/types";

export default function PlaygroundPage() {
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [currentResult, setCurrentResult] = useState<PrototypeResult | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [currentExpId, setCurrentExpId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const conversationRef = useRef(conversationHistory);
  conversationRef.current = conversationHistory;
  const currentExpIdRef = useRef(currentExpId);
  currentExpIdRef.current = currentExpId;

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

  const persistExperiment = useCallback((exp: Experiment) => {
    fetch("/api/experiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exp),
    }).catch(() => {});
  }, []);

  const recordUsage = useCallback((experimentId: string, usage: unknown) => {
    fetch("/api/usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ experimentId, usage }),
    })
      .then((res) => res.json())
      .then(setUsageSummary)
      .catch(() => {});
  }, []);

  const handleApiKeyComplete = useCallback(() => {
    setApiKeyConfigured(true);
  }, []);

  const handleApiKeyReset = useCallback(() => {
    setApiKeyConfigured(false);
  }, []);

  /**
   * SSE 스트림을 소비하여 점진적 UI 업데이트
   */
  const handleGenerate = useCallback(
    async (prompt: string, files?: File[]) => {
      setIsLoading(true);
      setError(null);
      setStreamingText("");

      const history = conversationRef.current;

      // 사용자 메시지 표시용 (파일명 포함)
      const displayPrompt = files && files.length > 0
        ? `${prompt}\n\n[첨부: ${files.map((f) => f.name).join(", ")}]`
        : prompt;
      const userMessage: ChatMessage = { role: "user", content: displayPrompt };
      setConversationHistory((prev) => [...prev, userMessage]);

      try {
        let body: BodyInit;
        let headers: Record<string, string> = {};

        if (files && files.length > 0) {
          // FormData로 파일 전송
          const formData = new FormData();
          formData.append("prompt", prompt);
          formData.append("conversationHistory", JSON.stringify(history));
          for (const file of files) {
            formData.append("files", file);
          }
          body = formData;
          // Content-Type은 브라우저가 자동 설정 (boundary 포함)
        } else {
          headers = { "Content-Type": "application/json" };
          body = JSON.stringify({ prompt, conversationHistory: history });
        }

        const response = await fetch("/api/generate", {
          method: "POST",
          headers,
          body,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "생성에 실패했습니다.");
        }

        // SSE 스트림 소비
        const reader = response.body?.getReader();
        if (!reader) throw new Error("스트림을 읽을 수 없습니다.");

        const decoder = new TextDecoder();
        let buffer = "";
        let resultId = "";
        let fullStreamedText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE 이벤트 파싱
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // 마지막 불완전 라인 보존

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6);
            if (!jsonStr) continue;

            try {
              const event: StreamEvent = JSON.parse(jsonStr);

              if (event.type === "start") {
                resultId = event.id;
                // 생성 중 상태로 미리보기 표시
                setCurrentResult({
                  id: resultId,
                  preview: "",
                  code: "",
                  apis: [],
                  summary: "생성 중...",
                  conversationHistory: [...history, userMessage],
                  status: "generating",
                  createdAt: new Date().toISOString(),
                });
              } else if (event.type === "text_delta") {
                fullStreamedText += event.content;
                setStreamingText(fullStreamedText);
              } else if (event.type === "complete") {
                const result: PrototypeResult = {
                  id: resultId,
                  preview: event.html,
                  code: event.html,
                  apis: event.apis,
                  summary: event.summary,
                  conversationHistory: event.conversationHistory,
                  status: "ready",
                  createdAt: new Date().toISOString(),
                  usage: event.usage,
                };

                setCurrentResult(result);
                setConversationHistory(event.conversationHistory);
                setStreamingText("");

                // 실험 저장
                const isNew = history.length === 0;
                if (isNew) {
                  const exp: Experiment = {
                    id: resultId,
                    title: prompt.slice(0, 40) || (files?.[0]?.name || "실험"),
                    result,
                    createdAt: result.createdAt,
                  };
                  setExperiments((prev) => [exp, ...prev]);
                  setCurrentExpId(resultId);
                  persistExperiment(exp);
                  recordUsage(resultId, event.usage);
                } else {
                  const expId = currentExpIdRef.current;
                  if (expId) {
                    setExperiments((prev) =>
                      prev.map((exp) => {
                        if (exp.id === expId) {
                          const updated = { ...exp, result };
                          persistExperiment(updated);
                          return updated;
                        }
                        return exp;
                      })
                    );
                    recordUsage(expId, event.usage);
                  }
                }
              } else if (event.type === "error") {
                throw new Error(event.message);
              }
            } catch (parseErr) {
              // 이벤트 파싱 실패 시 에러가 아닌 경우만 무시
              if (parseErr instanceof Error && parseErr.message !== jsonStr) {
                throw parseErr;
              }
            }
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
        setConversationHistory((prev) => prev.slice(0, -1));
        setStreamingText("");
        // 에러 시 generating 상태 되돌리기
        setCurrentResult((prev) =>
          prev?.status === "generating" ? null : prev
        );
      } finally {
        setIsLoading(false);
      }
    },
    [persistExperiment, recordUsage]
  );

  const handleNewExperiment = useCallback(() => {
    setCurrentResult(null);
    setConversationHistory([]);
    setCurrentExpId(null);
    setError(null);
    setStreamingText("");
  }, []);

  const handleSelectExperiment = useCallback((exp: Experiment) => {
    setCurrentResult(exp.result);
    setConversationHistory(exp.result.conversationHistory);
    setCurrentExpId(exp.id);
    setError(null);
    setStreamingText("");
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
                    streamingText={streamingText}
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
                  자연어, PDF, 이미지, Excel, 코드 파일을 입력하면 Claude Opus가 UI를 생성합니다.
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
                    <p className="text-sm font-medium text-gray-700">1. 입력</p>
                    <p className="text-xs text-gray-400 mt-1">
                      텍스트, PDF, 엑셀, 이미지, 코드 파일 등
                    </p>
                  </div>
                  <div className="p-4 bg-surface-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-700">2. 확인</p>
                    <p className="text-xs text-gray-400 mt-1">
                      실시간 스트리밍으로 UI 생성 과정 확인
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
