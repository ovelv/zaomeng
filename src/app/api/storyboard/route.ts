import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";

function getApiKey() {
  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) {
    throw new Error("未配置 ARK_API_KEY 环境变量");
  }
  return apiKey;
}

export async function POST(request: NextRequest) {
  try {
    const { theme, duration, sceneCount, settings } = await request.json();

    if (!theme?.trim()) {
      return NextResponse.json({ error: "Missing theme" }, { status: 400 });
    }

    if (!settings || !settings.arkApiKey || !settings.arkBaseUrl || !settings.storyboardModel) {
      return NextResponse.json({ error: "缺少火山引擎配置，请先在系统设置中配置 ARK_API_KEY, ARK_BASE_URL 和 STORYBOARD_MODEL。" }, { status: 400 });
    }

    const apiKey = settings.arkApiKey;
    const baseUrl = settings.arkBaseUrl.replace(/\/$/, "");
    const model = settings.storyboardModel;

    const prompt = `你是一个专业的萌宠短视频导演。请根据以下内容主题，为我生成一个 3-5 个分镜的视频脚本。
注意：每段时长控制在 4-8 秒之间。

主题：${theme}

请严格输出以下 JSON 数组格式，不要包含其他 markdown 格式说明（不要\`\`\`json）：
[
  {
    "scene": 1,
    "description": "详细的画面主体描述，用于 AI 生图（如：一只戴着红围巾的可爱金毛犬，正在草地上奔跑，阳光明媚）",
    "camera": "详细的镜头语言和运镜说明，用于视频生成（如：跟随镜头，推镜头，慢动作，无字幕，高质量）",
    "subtitle": "适合作为这一个分镜旁白或视频字幕的台词，请确保台词生动、口语化，不要带有括号等格式（如：哇！这片森林里到底藏着什么宝贝呢？）",
    "duration": 5
  }
]`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: "你是一个只能输出 JSON 的 AI 助手。" },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`方舟 API 请求失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("大模型未返回内容");
    }

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    const storyboard = JSON.parse(jsonStr);

    return NextResponse.json({ storyboard });
  } catch (error) {
    console.error("Storyboard Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "分镜生成失败" },
      { status: 500 }
    );
  }
}
