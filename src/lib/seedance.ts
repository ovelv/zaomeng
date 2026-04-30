import {
  DEFAULT_CAMERA_TEMPLATE,
  DEFAULT_PERSONA_TEMPLATE,
} from "@/lib/prompt-templates";

type SeedanceContent =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string }; role?: string };

export type CreateSeedanceTaskInput = {
  prompt: string;
  model: string;
  ratio: string;
  resolution: string;
  duration: number;
  generateAudio: boolean;
  watermark: boolean;
  returnLastFrame: boolean;
  assetId?: string;
  firstFrameUrl?: string;
  referenceImageUrl?: string;
  apiKey: string;
  baseUrl: string;
};

export type SeedanceTaskResult = {
  id: string;
  status: string;
  videoUrl?: string;
  lastFrameUrl?: string;
  raw: unknown;
  error?: string;
};

function getBaseUrl(inputBaseUrl: string) {
  if (!inputBaseUrl) throw new Error("Missing ARK_BASE_URL. 请在设置页面配置。");
  return inputBaseUrl.replace(/\/$/, "");
}

function getApiKey(inputApiKey: string) {
  if (!inputApiKey) {
    throw new Error("Missing ARK_API_KEY. 请在设置页面配置 API Key。");
  }
  return inputApiKey;
}

function buildHeaders(inputApiKey: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getApiKey(inputApiKey)}`,
  };
}

function pickVideoUrl(payload: Record<string, unknown>) {
  const content = (payload.content as Record<string, unknown> | undefined) ?? {};
  return (
    (content.video_url as string | undefined) ??
    (payload.video_url as string | undefined) ??
    (content.url as string | undefined)
  );
}

function pickLastFrameUrl(payload: Record<string, unknown>) {
  const content = (payload.content as Record<string, unknown> | undefined) ?? {};
  return (
    (content.last_frame_url as string | undefined) ??
    (content.last_frame_image_url as string | undefined) ??
    (payload.last_frame_url as string | undefined) ??
    (payload.last_frame_image_url as string | undefined)
  );
}

export function buildPrompt(
  segmentText: string,
  index: number,
  total: number,
  personaTemplate = DEFAULT_PERSONA_TEMPLATE,
  cameraTemplate = DEFAULT_CAMERA_TEMPLATE
) {
  return [
    "写实竖版短视频，适合抖音发布。",
    "参考图片1中的虚拟人形象，保持人物身份稳定、自然口播状态。",
    `固定人设模板：${personaTemplate}`,
    `固定口播镜头模板：${cameraTemplate}`,
    "口播时表情自然，嘴型清晰，动作克制，整体保持稳定输出。",
    `这是第${index}段，共${total}段，保持统一的人设、布光和镜头语言。`,
    `人物口播说：“${segmentText}”`,
  ].join("\n");
}

export async function createSeedanceTask(input: CreateSeedanceTaskInput) {
  if (!input.model) throw new Error("Missing model for Seedance");

  const baseUrl = getBaseUrl(input.baseUrl);

  const content: SeedanceContent[] = [{ type: "text", text: input.prompt }];

  if (input.firstFrameUrl) {
    content.push({
      type: "image_url",
      image_url: { url: input.firstFrameUrl },
      role: "first_frame",
    });
  }
  
  if (input.referenceImageUrl) {
    content.push({
      type: "image_url",
      image_url: { url: input.referenceImageUrl },
      role: "reference_image",
    });
  } else if (input.assetId) {
    content.push({
      type: "image_url",
      image_url: { url: `asset://${input.assetId}` },
      role: "reference_image",
    });
  }

  const response = await fetch(`${baseUrl}/contents/generations/tasks`, {
    method: "POST",
    headers: buildHeaders(input.apiKey),
    body: JSON.stringify({
      model: input.model,
      content,
      ratio: input.ratio,
      resolution: input.resolution,
      duration: input.duration,
      generate_audio: input.generateAudio,
      return_last_frame: input.returnLastFrame,
      watermark: input.watermark,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`创建 Seedance 任务失败: ${message}`);
  }

  return (await response.json()) as { id: string };
}

export async function getSeedanceTask(
  taskId: string,
  apiKey: string,
  baseUrlInput: string
): Promise<SeedanceTaskResult> {
  const baseUrl = getBaseUrl(baseUrlInput);
  const response = await fetch(`${baseUrl}/contents/generations/tasks/${taskId}`, {
    method: "GET",
    headers: buildHeaders(apiKey),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`查询 Seedance 任务失败: ${message}`);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  return {
    id: String(payload.id ?? taskId),
    status: String(payload.status ?? "unknown"),
    videoUrl: pickVideoUrl(payload),
    lastFrameUrl: pickLastFrameUrl(payload),
    raw: payload,
    error: (payload.error as { message?: string } | undefined)?.message,
  };
}

export async function pollSeedanceTask(taskId: string, apiKey: string, baseUrl: string) {
  while (true) {
    const task = await getSeedanceTask(taskId, apiKey, baseUrl);
    if (["succeeded", "failed", "expired"].includes(task.status)) {
      return task;
    }
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
}
