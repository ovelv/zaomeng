export type SeedreamAspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export type CreateSeedreamTaskInput = {
  prompt: string;
  model: string;
  aspectRatio?: SeedreamAspectRatio;
  referenceImageUrl?: string; // 用户上传的垫图
  apiKey: string;
  baseUrl: string;
};

export type SeedreamTaskResult = {
  id: string;
  status: "pending" | "running" | "succeeded" | "failed" | "expired";
  imageUrl?: string;
  raw: unknown;
  error?: string;
};

function getBaseUrl(inputBaseUrl: string) {
  if (!inputBaseUrl) throw new Error("Missing ARK_BASE_URL. 请在设置页面配置。");
  return inputBaseUrl.replace(/\/$/, "");
}

function getApiKey(inputApiKey: string) {
  if (!inputApiKey) throw new Error("Missing ARK_API_KEY. 请在设置页面配置 API Key。");
  return inputApiKey;
}

function buildHeaders(inputApiKey: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getApiKey(inputApiKey)}`,
  };
}

export async function createSeedreamTask(input: CreateSeedreamTaskInput): Promise<{
  id: string;
  imageUrl: string;
}> {
  if (!input.model) throw new Error("Missing model for Seedream");

  const BASE_URL = getBaseUrl(input.baseUrl);

  const body: any = {
    model: input.model,
    prompt: input.prompt,
    size: input.aspectRatio === "16:9" ? "2848x1600" :
          input.aspectRatio === "9:16" ? "1600x2848" :
          input.aspectRatio === "4:3" ? "2304x1728" :
          input.aspectRatio === "3:4" ? "1728x2304" :
          "2048x2048",
    watermark: false,
  };

  if (input.referenceImageUrl) {
    body.image = [input.referenceImageUrl];
  }

  const response = await fetch(`${BASE_URL}/images/generations`, {
    method: "POST",
    headers: buildHeaders(input.apiKey),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`创建 Seedream 任务失败: ${errorData}`);
  }

  const result = await response.json();
  const imageUrl = result.data?.[0]?.url;
  
  if (!imageUrl) {
    throw new Error(`Seedream 生图失败: 未返回图片 URL`);
  }

  // 返回一个伪造的异步任务ID，并附带 imageUrl，这样轮询可以直接返回成功
  return { id: `mock-task-${Date.now()}`, imageUrl };
}

export async function getSeedreamTask(taskId: string): Promise<SeedreamTaskResult> {
  // 因为现在是同步接口，这里不再需要真正去查询。
  // 但是如果我们要兼容原有的轮询逻辑，可以直接抛出错误或者返回特定的状态。
  // 注意：真实情况下，调用方不应该再使用轮询。
  throw new Error("同步生图接口不支持通过 getSeedreamTask 查询状态。");
}

export async function pollSeedreamTask(taskId: string, intervalMs = 3000) {
  // 如果调用方通过 createSeedreamTask 得到了包含 imageUrl 的伪任务，则直接在调用方处理。
  // 这个函数不再被需要。
  throw new Error("同步生图接口不支持轮询。");
}
