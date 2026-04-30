import { createSeedanceTask, pollSeedanceTask } from "./seedance";
import { Settings } from "./settings";

export type CustomJobStatus = "queued" | "running" | "succeeded" | "failed";

export type CustomJob = {
  id: string;
  prompt: string;
  firstFrameUrl?: string;
  referenceImageUrl?: string;
  assetId?: string;
  ratio: string;
  resolution: string;
  duration: number;
  generateAudio: boolean;
  watermark: boolean;
  status: CustomJobStatus;
  remoteTaskId?: string;
  videoUrl?: string;
  error?: string;
  settings: Settings;
  createdAt: string;
  updatedAt: string;
};

const globalForCustom = globalThis as typeof globalThis & {
  __zaomengCustom?: Map<string, CustomJob>;
};

const customStore = globalForCustom.__zaomengCustom ?? new Map<string, CustomJob>();
globalForCustom.__zaomengCustom = customStore;

function now() {
  return new Date().toISOString();
}

export function getCustomJob(id: string) {
  return customStore.get(id);
}

function updateJob(id: string, updater: (job: CustomJob) => CustomJob) {
  const job = customStore.get(id);
  if (job) {
    customStore.set(id, updater(job));
  }
}

export function createCustomJob(input: Omit<CustomJob, "id" | "status" | "createdAt" | "updatedAt">) {
  const id = crypto.randomUUID();
  const job: CustomJob = {
    ...input,
    id,
    status: "queued",
    createdAt: now(),
    updatedAt: now(),
  };
  customStore.set(id, job);
  void runCustomJob(id);
  return job;
}

async function runCustomJob(id: string) {
  const job = customStore.get(id);
  if (!job) return;

  updateJob(id, (j) => ({ ...j, status: "running" }));

  try {
    const created = await createSeedanceTask({
      prompt: job.prompt,
      model: job.settings.seedanceModel,
      ratio: job.ratio,
      resolution: job.resolution,
      duration: job.duration,
      generateAudio: job.generateAudio,
      watermark: job.watermark,
      returnLastFrame: false,
      firstFrameUrl: job.firstFrameUrl,
      referenceImageUrl: job.referenceImageUrl,
      assetId: job.assetId,
      apiKey: job.settings.arkApiKey,
      baseUrl: job.settings.arkBaseUrl,
    });

    updateJob(id, (j) => ({ ...j, remoteTaskId: created.id }));

    const result = await pollSeedanceTask(created.id, job.settings.arkApiKey, job.settings.arkBaseUrl);

    if (result.status === "succeeded" && result.videoUrl) {
      updateJob(id, (j) => ({ ...j, status: "succeeded", videoUrl: result.videoUrl }));
    } else {
      updateJob(id, (j) => ({ ...j, status: "failed", error: result.error || `状态: ${result.status}` }));
    }
  } catch (error) {
    updateJob(id, (j) => ({
      ...j,
      status: "failed",
      error: error instanceof Error ? error.message : "生成失败",
    }));
  }
}
