import { NextRequest, NextResponse } from "next/server";
import { splitNarration, summarizeSplit } from "@/lib/splitter";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    text?: string;
    targetMin?: number;
    targetMax?: number;
  };

  if (!body.text?.trim()) {
    return NextResponse.json({ error: "请输入口播文案" }, { status: 400 });
  }

  const segments = splitNarration(body.text, {
    targetMin: body.targetMin,
    targetMax: body.targetMax,
  });

  return NextResponse.json({
    segments,
    summary: summarizeSplit(segments),
  });
}
