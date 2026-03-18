"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { UploadedFile } from "@/types";

interface PromptInputProps {
  onSubmit: (prompt: string, files?: File[]) => void;
  isLoading: boolean;
  hasConversation: boolean;
}

const EXAMPLE_PROMPTS = [
  "고객 관리 대시보드에 매출 차트와 고객 테이블을 만들어줘",
  "SaaS 구독 요금제 선택 페이지를 디자인해줘",
  "프로젝트 관리 칸반보드를 만들어줘",
  "사용자 분석 대시보드 with 그래프와 KPI 카드",
];

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/plain", "text/html", "text/css", "text/csv", "text/markdown",
  "application/json", "application/xml",
];

const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.gif,.webp,.xlsx,.xls,.md,.html,.htm,.css,.js,.ts,.tsx,.jsx,.json,.csv,.txt,.xml,.yaml,.yml,.sql,.py";

function getFileIcon(file: UploadedFile): string {
  if (file.type === "application/pdf") return "PDF";
  if (file.type.startsWith("image/")) return "IMG";
  if (file.name.match(/\.xlsx?$/i)) return "XLS";
  if (file.name.match(/\.md$/i)) return "MD";
  if (file.name.match(/\.html?$/i)) return "HTML";
  if (file.name.match(/\.json$/i)) return "JSON";
  if (file.name.match(/\.csv$/i)) return "CSV";
  return "FILE";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function PromptInput({
  onSubmit,
  isLoading,
  hasConversation,
}: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, [prompt]);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const maxSize = 20 * 1024 * 1024; // 20MB

    const validFiles = fileArray.filter((f) => f.size <= maxSize && f.size > 0);

    setRawFiles((prev) => [...prev, ...validFiles]);
    setFiles((prev) => [
      ...prev,
      ...validFiles.map((f) => ({
        name: f.name,
        type: f.type,
        size: f.size,
      })),
    ]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setRawFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = () => {
    if ((prompt.trim() || files.length > 0) && !isLoading) {
      onSubmit(prompt.trim(), rawFiles.length > 0 ? rawFiles : undefined);
      setPrompt("");
      setFiles([]);
      setRawFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 드래그앤드롭
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  // 붙여넣기로 이미지 추가
  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedFiles = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((f): f is File => f !== null);

    if (pastedFiles.length > 0) {
      addFiles(pastedFiles);
    }
  };

  return (
    <div className="space-y-3">
      {/* 예시 프롬프트 */}
      {!hasConversation && files.length === 0 && (
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

      {/* 첨부 파일 목록 */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 bg-surface-50 border border-surface-200 rounded-lg px-2.5 py-1.5 text-xs"
            >
              <span className="font-mono text-[10px] px-1 py-0.5 rounded bg-surface-200 text-gray-600 font-bold">
                {getFileIcon(file)}
              </span>
              <span className="text-gray-700 max-w-[120px] truncate">{file.name}</span>
              <span className="text-gray-400">{formatSize(file.size)}</span>
              <button
                onClick={() => removeFile(i)}
                className="text-gray-400 hover:text-red-500 ml-0.5"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 입력 바 */}
      <div
        className={`flex gap-2 items-end rounded-xl border-2 transition-colors ${
          isDragging
            ? "border-primary-400 bg-primary-50"
            : "border-transparent"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* 파일 첨부 버튼 */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="p-3 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 shrink-0"
          title="파일 첨부 (PDF, 이미지, Excel, 코드 등)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              isDragging
                ? "파일을 여기에 놓으세요..."
                : hasConversation
                ? "수정 사항을 입력하세요... (예: '차트 색상을 파란색으로 바꿔줘')"
                : "만들고 싶은 SaaS 기능을 설명하세요... (파일 첨부도 가능)"
            }
            className="w-full px-3 py-3 border border-surface-300 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm min-h-[48px] max-h-[120px]"
            rows={1}
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={(!prompt.trim() && files.length === 0) || isLoading}
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

      {/* 안내 텍스트 */}
      <p className="text-xs text-gray-400">
        {hasConversation
          ? "이전 결과를 기반으로 수정됩니다. "
          : ""}
        Enter로 전송 · Shift+Enter 줄바꿈 · 파일 드래그앤드롭/붙여넣기 가능
        <span className="text-gray-300 ml-1">
          (PDF, 이미지, Excel, MD, HTML, 코드)
        </span>
      </p>
    </div>
  );
}
