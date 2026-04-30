import { buildPrompt, createSeedanceTask, pollSeedanceTask } from "@/lib/seedance";
import type { GenerationJob, SegmentDraft, SegmentTask } from "@/lib/types";

const globalForJobs = globalThis as typeof globalThis & {
  __zaomengJobs?: Map<string, GenerationJob>;
};

const jobStore = globalForJobs.__zaomengJobs ?? new Map<string, GenerationJob>();
globalForJobs.__zaomengJobs = jobStore;

function now() {
  return new Date().toISOString();
}

function clampDuration(duration: number) {
  return Math.min(15, Math.max(4, Math.round(duration)));
}

function updateJob(jobId: string, updater: (job: GenerationJob) => GenerationJob) {
  const current = jobStore.get(jobId);
  if (!current) {
    return;
  }
  jobStore.set(jobId, updater(current));
}

function updateSegment(
  jobId: string,
  segmentId: string,
  updater: (segment: SegmentTask) => SegmentTask
) {
  updateJob(jobId, (job) => ({
    ...job,
    updatedAt: now(),
    segments: job.segments.map((segment) =>
      segment.id === segmentId ? updater(segment) : segment
    ),
  }));
}

export function listJobs() {
  return Array.from(jobStore.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function getJob(jobId: string) {
  return jobStore.get(jobId);
}

export function createJob(input: Omit<GenerationJob, "id" | "status" | "segments" | "createdAt" | "updatedAt"> & { segments: Omit<SegmentTask, "id" | "status">[] }) {
  const jobId = crypto.randomUUID();
  const job: GenerationJob = {
    ...input,
    id: jobId,
    status: "queued",
    createdAt: now(),
    updatedAt: now(),
    segments: input.segments.map((s) => ({ ...s, id: crypto.randomUUID(), status: "pending" })),
  };
  jobStore.set(jobId, job);

  // Start background processing
  void runJob(jobId);
  return job;
}

export function retryJobSegment(jobId: string, segmentId: string) {
  const job = getJob(jobId);
  if (!job) return;

  updateSegment(jobId, segmentId, (current) => ({
    ...current,
    status: "pending",
    error: undefined,
    videoUrl: undefined,
  }));

  updateJob(jobId, (j) => ({ ...j, status: "queued", error: undefined }));
  void runJob(jobId);
}

async function runJob(jobId: string) {
  const original = jobStore.get(jobId);
  if (!original) {
    return;
  }

  updateJob(jobId, (job) => ({ ...job, status: "running", updatedAt: now() }));

  let failureCount = 0;

  for (const segment of original.segments) {
    const job = jobStore.get(jobId);
    if (!job) {
      return;
    }

    const currentSegment = job.segments.find((s) => s.id === segment.id);
    if (currentSegment?.status === "succeeded") {
      continue;
    }

    const prompt = buildPrompt(
      segment.text,
      segment.index,
      job.segments.length,
      job.personaTemplate,
      job.cameraTemplate
    );

    updateSegment(jobId, segment.id, (current) => ({
      ...current,
      prompt,
      status: "queued",
      startedAt: now(),
      error: undefined,
    }));

    try {
      const created = await createSeedanceTask({
        prompt,
        model: job.settings.seedanceModel,
        ratio: job.ratio,
        resolution: job.resolution,
        duration: clampDuration(segment.targetDurationSec),
        generateAudio: job.generateAudio,
        watermark: job.watermark,
        returnLastFrame: false,
        assetId: job.assetId,
        apiKey: job.settings.arkApiKey,
        baseUrl: job.settings.arkBaseUrl,
      });

      updateSegment(jobId, segment.id, (current) => ({
        ...current,
        remoteTaskId: created.id,
        status: "running",
      }));

      const result = await pollSeedanceTask(created.id, job.settings.arkApiKey, job.settings.arkBaseUrl);

      if (result.status !== "succeeded" || !result.videoUrl) {
        failureCount += 1;
        updateSegment(jobId, segment.id, (current) => ({
          ...current,
          status: "failed",
          error: result.error || `任务状态为 ${result.status}`,
          finishedAt: now(),
        }));
        break;
      }

      updateSegment(jobId, segment.id, (current) => ({
        ...current,
        status: "succeeded",
        videoUrl: result.videoUrl,
        finishedAt: now(),
      }));
    } catch (error) {
      failureCount += 1;
      updateSegment(jobId, segment.id, (current) => ({
        ...current,
        status: "failed",
        error: error instanceof Error ? error.message : "生成失败",
        finishedAt: now(),
      }));
      break;
    }
  }

  updateJob(jobId, (job) => {
    const hasFailed = job.segments.some((segment) => segment.status === "failed");
    const hasSucceeded = job.segments.some(
      (segment) => segment.status === "succeeded"
    );

    return {
      ...job,
      updatedAt: now(),
      status: hasFailed ? (hasSucceeded ? "partial_failed" : "failed") : "completed",
      error: failureCount ? "部分片段生成失败，请检查错误信息后重试。" : undefined,
    };
  });
}
