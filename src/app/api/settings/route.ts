import { NextResponse } from "next/server";
import { isApiKeyConfigured } from "@/lib/api-key-store";

export async function GET() {
  return NextResponse.json({ configured: isApiKeyConfigured() });
}
