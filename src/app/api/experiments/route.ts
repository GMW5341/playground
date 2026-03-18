import { NextResponse } from "next/server";
import { loadExperiments, saveExperiment, deleteExperiment } from "@/lib/experiment-store";
import { deleteExperimentUsage } from "@/lib/usage-store";
import type { Experiment } from "@/types";

// 실험 목록 조회
export async function GET() {
  const experiments = loadExperiments();
  return NextResponse.json(experiments);
}

// 실험 저장/업데이트
export async function POST(request: Request) {
  try {
    const experiment: Experiment = await request.json();
    saveExperiment(experiment);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Experiment save error:", error);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}

// 실험 삭제
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const success = deleteExperiment(id);
    deleteExperimentUsage(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("Experiment delete error:", error);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
