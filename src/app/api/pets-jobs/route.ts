import { NextRequest, NextResponse } from "next/server";
import { createPetJob, listPetJobs } from "@/lib/pets-store";

export async function GET() {
  return NextResponse.json({ jobs: listPetJobs() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.theme?.trim()) {
    return NextResponse.json({ error: "缺少内容主题" }, { status: 400 });
  }
  if (!body.globalCharacter?.trim()) {
    return NextResponse.json({ error: "缺少主角设定" }, { status: 400 });
  }
  if (!body.scenes?.length) {
    return NextResponse.json({ error: "缺少分镜数据" }, { status: 400 });
  }

  const job = createPetJob({
    theme: body.theme,
    globalCharacter: body.globalCharacter,
    referenceImageUrl: body.referenceImageUrl,
    scenes: body.scenes,
    settings: body.settings,
  });

  return NextResponse.json({ job });
}
