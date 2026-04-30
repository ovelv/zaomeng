import { NextRequest, NextResponse } from "next/server";
import { createCustomJob } from "@/lib/custom-store";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: "缺少提示词" }, { status: 400 });
  }

  const job = createCustomJob({
    prompt: body.prompt,
    firstFrameUrl: body.firstFrameUrl?.trim() || undefined,
    referenceImageUrl: body.referenceImageUrl?.trim() || undefined,
    assetId: body.assetId?.trim() || undefined,
    ratio: body.ratio || "9:16",
    resolution: body.resolution || "720p",
    duration: body.duration || 5,
    generateAudio: body.generateAudio ?? false,
    watermark: body.watermark ?? false,
    settings: body.settings,
  });

  return NextResponse.json({ job });
}
