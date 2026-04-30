import { NextRequest, NextResponse } from "next/server";
import { createJob, listJobs } from "@/lib/jobs-store";
import { CreateJobInput } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ jobs: listJobs() });
}

export async function POST(request: NextRequest) {
  const body: CreateJobInput = await request.json();

  if (!body.sourceText?.trim()) {
    return NextResponse.json({ error: "缺少原始口播文案" }, { status: 400 });
  }

  if (!body.assetId?.trim()) {
    return NextResponse.json({ error: "缺少虚拟人 assetId" }, { status: 400 });
  }

  if (!body.personaTemplate?.trim()) {
    return NextResponse.json({ error: "缺少固定人设模板" }, { status: 400 });
  }

  if (!body.cameraTemplate?.trim()) {
    return NextResponse.json({ error: "缺少固定口播镜头模板" }, { status: 400 });
  }

  if (!body.segments?.length) {
    return NextResponse.json({ error: "请先完成分段" }, { status: 400 });
  }

  const hasInvalidDuration = body.segments.some(
    (segment) =>
      typeof segment.targetDurationSec !== "number" ||
      segment.targetDurationSec < 4 ||
      segment.targetDurationSec > 15
  );

  if (hasInvalidDuration) {
    return NextResponse.json(
      { error: "每一段时长都需要在 4 到 15 秒之间" },
      { status: 400 }
    );
  }

  const job = createJob({
    sourceText: body.sourceText,
    assetId: body.assetId,
    personaTemplate: body.personaTemplate,
    cameraTemplate: body.cameraTemplate,
    title: body.title,
    model: body.model || process.env.SEEDANCE_MODEL || "doubao-seedance-2-0-260128",
    ratio: body.ratio || "9:16",
    resolution: body.resolution || "720p",
    duration: body.duration || 15,
    generateAudio: body.generateAudio ?? true,
    watermark: body.watermark ?? false,
    segments: body.segments,
    settings: body.settings,
  });

  return NextResponse.json({ job });
}
