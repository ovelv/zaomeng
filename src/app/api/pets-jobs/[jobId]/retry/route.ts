import { NextRequest, NextResponse } from "next/server";
import { retryPetScene } from "@/lib/pets-store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const body = await request.json();
  
  if (!body.sceneId || !body.type) {
    return NextResponse.json({ error: "Missing sceneId or type" }, { status: 400 });
  }

  retryPetScene(jobId, body.sceneId, body.type);
  return NextResponse.json({ success: true });
}
