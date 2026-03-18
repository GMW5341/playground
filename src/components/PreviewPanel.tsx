"use client";

import { useState } from "react";
import type { PrototypeResult } from "@/types";

interface PreviewPanelProps {
  result: PrototypeResult;
}

type ViewTab = "preview" | "code" | "api";

export default function PreviewPanel({ result }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>("preview");
  const [copied, setCopied] = useState(false);

  const tabs: { key: ViewTab; label: string; show: boolean }[] = [
    { key: "preview", label: "미리보기", show: true },
    { key: "code", label: "HTML 코드", show: !!result.code },
    { key: "api", label: "API 스펙", show: result.apis.length > 0 },
  ];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card overflow-hidden h-full flex flex-col">
      {/* 탭 헤더 */}
      <div className="flex border-b border-surface-200 shrink-0">
        {tabs
          .filter((t) => t.show)
          .map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50/50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 min-h-0">
        {activeTab === "preview" && (
          <div className="h-full flex flex-col">
            {/* 브라우저 크롬 */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-50 border-b border-surface-200 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <div className="ml-2 flex-1 bg-white border border-surface-200 rounded px-2 py-0.5 text-xs text-gray-400">
                localhost:3000/preview
              </div>
            </div>
            <iframe
              srcDoc={result.preview}
              className="w-full flex-1 border-0"
              sandbox="allow-scripts allow-popups"
              title="Preview"
            />
          </div>
        )}

        {activeTab === "code" && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 shrink-0">
              <span className="text-xs text-gray-400">index.html</span>
              <button
                onClick={handleCopy}
                className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded"
              >
                {copied ? "복사됨!" : "복사"}
              </button>
            </div>
            <pre className="flex-1 overflow-auto bg-gray-900 text-gray-100 p-4 text-xs leading-relaxed">
              <code>{result.code}</code>
            </pre>
          </div>
        )}

        {activeTab === "api" && (
          <div className="p-4 space-y-3 overflow-auto h-full">
            {result.apis.map((api, i) => (
              <div key={i} className="border border-surface-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      api.method === "GET" ? "bg-green-100 text-green-700" :
                      api.method === "POST" ? "bg-blue-100 text-blue-700" :
                      api.method === "PUT" ? "bg-yellow-100 text-yellow-700" :
                      api.method === "DELETE" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {api.method}
                  </span>
                  <code className="text-sm text-gray-700">{api.path}</code>
                </div>
                <p className="text-sm text-gray-500 mb-2">{api.description}</p>
                {api.requestBody && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-500 mb-1">Request</p>
                    <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs">
                      <code>{api.requestBody}</code>
                    </pre>
                  </div>
                )}
                {api.responseBody && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Response</p>
                    <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs">
                      <code>{api.responseBody}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
