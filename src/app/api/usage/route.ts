import { NextResponse } from "next/server";
import { loadUsage, recordUsage, deleteExperimentUsage } from "@/lib/usage-store";

export async function GET() {
  return NextResponse.json(loadUsage());
}

export async function POST(request: Request) {
  try {
    const { experimentId, usage } = await request.json();
    const updated = recordUsage(experimentId, usage);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Usage record error:", error);
    return NextResponse.json({ error: "사용량 기록 실패" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { experimentId } = await request.json();
    deleteExperimentUsage(experimentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Usage delete error:", error);
    return NextResponse.json({ error: "사용량 삭제 실패" }, { status: 500 });
  }
}
