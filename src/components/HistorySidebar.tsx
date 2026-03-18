"use client";

import type { PrototypeResult } from "@/types";

interface HistorySidebarProps {
  history: PrototypeResult[];
  selectedId: string | null;
  onSelect: (result: PrototypeResult) => void;
  onClear: () => void;
}

export default function HistorySidebar({
  history,
  selectedId,
  onSelect,
  onClear,
}: HistorySidebarProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        <p>아직 실험 이력이 없습니다.</p>
        <p className="mt-1">자연어를 입력하여 첫 프로토타입을 생성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">실험 이력</h3>
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          전체 삭제
        </button>
      </div>
      {history.map((result) => (
        <button
          key={result.id}
          onClick={() => onSelect(result)}
          className={`w-full text-left p-3 rounded-lg transition-colors ${
            selectedId === result.id
              ? "bg-primary-50 border border-primary-200"
              : "bg-surface-50 hover:bg-surface-100 border border-transparent"
          }`}
        >
          <p className="text-sm font-medium text-gray-700 truncate">
            {result.request.prompt}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${
                result.request.category === "ui"
                  ? "bg-purple-100 text-purple-700"
                  : result.request.category === "api"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {result.request.category === "ui"
                ? "UI"
                : result.request.category === "api"
                ? "API"
                : "풀스택"}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(result.createdAt).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
