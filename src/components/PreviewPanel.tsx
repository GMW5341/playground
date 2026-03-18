"use client";

import { useState } from "react";
import type { PrototypeResult } from "@/types";

interface PreviewPanelProps {
  result: PrototypeResult;
}

type ViewTab = "preview" | "components" | "api";

export default function PreviewPanel({ result }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>("preview");
  const [selectedComponent, setSelectedComponent] = useState(0);

  const tabs: { key: ViewTab; label: string; count?: number }[] = [
    { key: "preview", label: "미리보기" },
    { key: "components", label: "UI 컴포넌트", count: result.components.length },
    { key: "api", label: "API 스펙", count: result.apis.length },
  ];

  return (
    <div className="card overflow-hidden">
      {/* 탭 헤더 */}
      <div className="flex border-b border-surface-200">
        {tabs.map((tab) => (
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
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs bg-surface-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="min-h-[400px]">
        {activeTab === "preview" && (
          <div className="p-4">
            <div className="bg-white border border-surface-200 rounded-lg overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-50 border-b border-surface-200">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-gray-400">localhost:3000</span>
              </div>
              <iframe
                srcDoc={result.preview}
                className="w-full h-[500px] border-0"
                sandbox="allow-scripts"
                title="Preview"
              />
            </div>
          </div>
        )}

        {activeTab === "components" && (
          <div className="p-4 space-y-4">
            {result.components.length === 0 ? (
              <p className="text-gray-400 text-center py-8">생성된 UI 컴포넌트가 없습니다.</p>
            ) : (
              <>
                {result.components.length > 1 && (
                  <div className="flex gap-2">
                    {result.components.map((comp, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedComponent(i)}
                        className={`text-xs px-3 py-1.5 rounded-lg ${
                          selectedComponent === i
                            ? "bg-primary-100 text-primary-700"
                            : "bg-surface-100 text-gray-600"
                        }`}
                      >
                        {comp.name}
                      </button>
                    ))}
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">{result.components[selectedComponent].name}</h3>
                    <span className="text-xs text-gray-400">{result.components[selectedComponent].language}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{result.components[selectedComponent].description}</p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed">
                    <code>{result.components[selectedComponent].code}</code>
                  </pre>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "api" && (
          <div className="p-4 space-y-3">
            {result.apis.length === 0 ? (
              <p className="text-gray-400 text-center py-8">생성된 API 스펙이 없습니다.</p>
            ) : (
              result.apis.map((api, i) => (
                <details key={i} className="group border border-surface-200 rounded-lg">
                  <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-50">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        api.method === "GET" ? "bg-green-100 text-green-700" :
                        api.method === "POST" ? "bg-blue-100 text-blue-700" :
                        api.method === "PUT" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}
                    >
                      {api.method}
                    </span>
                    <code className="text-sm text-gray-700">{api.path}</code>
                    <span className="text-xs text-gray-400 ml-auto">{api.description}</span>
                  </summary>
                  <div className="px-4 pb-4 space-y-3 border-t border-surface-200 pt-3">
                    {api.requestBody && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Request Body</p>
                        <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs">
                          <code>{api.requestBody}</code>
                        </pre>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Response</p>
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs">
                        <code>{api.responseBody}</code>
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">구현 코드</p>
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs">
                        <code>{api.code}</code>
                      </pre>
                    </div>
                  </div>
                </details>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
