import { NextRequest, NextResponse } from "next/server";
import { retryJobSegment } from "@/lib/jobs-store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const body = await request.json();
  
  if (!body.segmentId) {
    return NextResponse.json({ error: "Missing segmentId" }, { status: 400 });
  }

  retryJobSegment(jobId, body.segmentId);
  return NextResponse.json({ success: true });
}
