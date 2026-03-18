"use client";

import { useState } from "react";
import type { UsageSummary } from "@/types";

interface HeaderProps {
  apiKeyConfigured: boolean;
  onApiKeyReset?: () => void;
  usageSummary?: UsageSummary | null;
}

export default function Header({ apiKeyConfigured, onApiKeyReset, usageSummary }: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showUsage, setShowUsage] = useState(false);

  return (
    <header className="border-b border-surface-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            P
          </div>
          <h1 className="text-lg font-semibold text-gray-900">
            SaaS Prototype Playground
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <nav className="flex items-center gap-4">
            <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              시험장
            </a>
            <a href="/history" className="text-gray-600 hover:text-gray-900 transition-colors">
              실험 이력
            </a>
          </nav>

          {/* 사용량 버튼 */}
          {usageSummary && (
            <div className="relative">
              <button
                onClick={() => { setShowUsage(!showUsage); setShowSettings(false); }}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-surface-50 transition-colors border border-surface-200"
                title="사용량 대시보드"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                <span className="font-medium">
                  ${usageSummary.allTimeCostUsd.toFixed(2)}
                </span>
              </button>

              {showUsage && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUsage(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-surface-200 rounded-xl shadow-lg z-20 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">
                      사용량 대시보드
                    </h3>

                    {/* 전체 토큰 */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-surface-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">입력 토큰</p>
                        <p className="text-lg font-bold text-gray-900">
                          {usageSummary.allTimeInputTokens.toLocaleString("ko-KR")}
                        </p>
                      </div>
                      <div className="bg-surface-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">출력 토큰</p>
                        <p className="text-lg font-bold text-gray-900">
                          {usageSummary.allTimeOutputTokens.toLocaleString("ko-KR")}
                        </p>
                      </div>
                    </div>

                    {/* 예상 비용 */}
                    <div className="bg-primary-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-primary-600">예상 총 비용</p>
                      <p className="text-xl font-bold text-primary-700">
                        ${usageSummary.allTimeCostUsd.toFixed(4)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        입력 $15/M · 출력 $75/M (Opus 4 기준)
                      </p>
                    </div>

                    {/* 실험별 사용량 */}
                    {usageSummary.experiments.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          실험별 사용량 ({usageSummary.experiments.length}건)
                        </p>
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {usageSummary.experiments.map((exp) => (
                            <div
                              key={exp.experimentId}
                              className="flex justify-between items-center text-xs py-2 px-2 rounded-md hover:bg-surface-50"
                            >
                              <div className="text-gray-600 truncate max-w-[120px]">
                                <span className="font-mono">
                                  {exp.experimentId.replace("proto_", "").slice(0, 10)}
                                </span>
                                <span className="text-gray-400 ml-1">
                                  ({exp.calls.length}회)
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-gray-700 font-medium">
                                  {(exp.totalInputTokens + exp.totalOutputTokens).toLocaleString("ko-KR")}
                                </span>
                                <span className="text-gray-400 ml-1">토큰</span>
                                <p className="text-gray-400">
                                  ${exp.totalCostUsd.toFixed(3)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {usageSummary.experiments.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-2">
                        아직 사용 기록이 없습니다
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 설정 버튼 */}
          <div className="relative">
            <button
              onClick={() => { setShowSettings(!showSettings); setShowUsage(false); }}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-surface-50"
              title="설정"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span
                className={`w-2 h-2 rounded-full ${
                  apiKeyConfigured ? "bg-green-500" : "bg-red-400"
                }`}
              />
            </button>

            {showSettings && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSettings(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-surface-200 rounded-xl shadow-lg z-20 p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">설정</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API 키</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          apiKeyConfigured
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {apiKeyConfigured ? "설정됨" : "미설정"}
                      </span>
                    </div>
                    {apiKeyConfigured && onApiKeyReset && (
                      <button
                        onClick={() => {
                          onApiKeyReset();
                          setShowSettings(false);
                        }}
                        className="w-full text-left text-xs text-gray-500 hover:text-gray-700 py-1"
                      >
                        API 키 재설정
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
