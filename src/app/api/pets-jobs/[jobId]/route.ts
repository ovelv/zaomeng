import { NextRequest, NextResponse } from "next/server";
import { getPetJob } from "@/lib/pets-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = getPetJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 });
  }

  return NextResponse.json({ job });
}
