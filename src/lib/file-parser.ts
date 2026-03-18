import type { ContentBlock } from "@/types";
import * as XLSX from "xlsx";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const TEXT_EXTENSIONS = [".md", ".html", ".htm", ".css", ".js", ".ts", ".tsx", ".jsx", ".json", ".csv", ".txt", ".xml", ".yaml", ".yml", ".sql", ".py", ".java", ".go", ".rs", ".c", ".cpp", ".h"];

/**
 * 업로드된 파일들을 Claude API ContentBlock[] 형식으로 변환
 */
export async function parseFiles(
  formData: FormData,
  textPrompt: string
): Promise<ContentBlock[]> {
  const blocks: ContentBlock[] = [];
  const files = formData.getAll("files") as File[];

  for (const file of files) {
    if (!file || file.size === 0) continue;

    if (file.type === "application/pdf") {
      // PDF → document 블록
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      blocks.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: base64,
        },
      });
    } else if (IMAGE_TYPES.includes(file.type)) {
      // 이미지 → image 블록
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      blocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: base64,
        },
      });
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel" ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls")
    ) {
      // Excel → 텍스트로 변환
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      let csvContent = `[파일: ${file.name}]\n\n`;

      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        csvContent += `## 시트: ${sheetName}\n${csv}\n\n`;
      }

      blocks.push({ type: "text", text: csvContent });
    } else if (isTextFile(file.name, file.type)) {
      // 텍스트 파일 → text 블록
      const text = await file.text();
      const ext = file.name.split(".").pop() || "";
      blocks.push({
        type: "text",
        text: `[파일: ${file.name}]\n\`\`\`${ext}\n${text}\n\`\`\``,
      });
    } else {
      // 지원하지 않는 형식
      blocks.push({
        type: "text",
        text: `[파일: ${file.name}] - 지원하지 않는 형식 (${file.type})`,
      });
    }
  }

  // 텍스트 프롬프트를 마지막에 추가
  if (textPrompt.trim()) {
    blocks.push({ type: "text", text: textPrompt.trim() });
  }

  // 블록이 없으면 기본 텍스트
  if (blocks.length === 0) {
    blocks.push({ type: "text", text: textPrompt || "UI를 생성해주세요." });
  }

  return blocks;
}

function isTextFile(name: string, mimeType: string): boolean {
  if (mimeType.startsWith("text/")) return true;
  const lower = name.toLowerCase();
  return TEXT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
