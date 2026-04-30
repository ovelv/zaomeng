import { PetJob, PetJobStatus, StoryboardScene } from "./types-pets";
import { createSeedreamTask } from "./seedream";
import { createSeedanceTask, pollSeedanceTask } from "./seedance";

// TODO: add arkApiKey?: string to PetJob in types-pets.ts
const globalForPets = globalThis as typeof globalThis & {
  __zaomengPets?: Map<string, PetJob>;
};

const petStore = globalForPets.__zaomengPets ?? new Map<string, PetJob>();
globalForPets.__zaomengPets = petStore;

function now() {
  return new Date().toISOString();
}

export function getPetJob(id: string) {
  return petStore.get(id);
}

export function listPetJobs() {
  return Array.from(petStore.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function updateJob(jobId: string, updater: (job: PetJob) => PetJob) {
  const current = petStore.get(jobId);
  if (!current) return;
  petStore.set(jobId, updater(current));
}

function updateScene(jobId: string, sceneId: string, updater: (scene: StoryboardScene) => StoryboardScene) {
  updateJob(jobId, (job) => ({
    ...job,
    updatedAt: now(),
    scenes: job.scenes.map((s) => (s.id === sceneId ? updater(s) : s)),
  }));
}

export function createPetJob(input: Omit<PetJob, "id" | "status" | "createdAt" | "updatedAt">) {
  const jobId = crypto.randomUUID();
  const job: PetJob = {
    ...input,
    id: jobId,
    status: "generating_images",
    createdAt: now(),
    updatedAt: now(),
  };
  petStore.set(jobId, job);
  void runPetJobPipeline(jobId);
  return job;
}

export function retryPetScene(jobId: string, sceneId: string, type: "image" | "video" | "both") {
  const job = getPetJob(jobId);
  if (!job) return;

  updateScene(jobId, sceneId, (s) => {
    const next = { ...s };
    if (type === "image" || type === "both") {
      next.imageStatus = "pending";
      next.imageUrl = undefined;
      next.imageError = undefined;
      // If we regenerate image, video must be regenerated
      next.videoStatus = "pending";
      next.videoUrl = undefined;
      next.videoError = undefined;
    } else if (type === "video") {
      next.videoStatus = "pending";
      next.videoUrl = undefined;
      next.videoError = undefined;
    }
    return next;
  });

  updateJob(jobId, (j) => ({ ...j, status: "generating_images", error: undefined }));
  void runPetJobPipeline(jobId);
}

async function runPetJobPipeline(jobId: string) {
  // Phase 1: Generate Images
  const job = petStore.get(jobId);
  if (!job) return;

  let imageFailures = 0;
  for (const scene of job.scenes) {
    const freshJob = petStore.get(jobId);
    const currentScene = freshJob?.scenes.find(s => s.id === scene.id);
    if (currentScene?.imageStatus === "succeeded") continue; // support resume

    updateScene(jobId, scene.id, (s) => ({ ...s, imageStatus: "generating", imageError: undefined }));
    try {
      const prompt = `主体角色：${job.globalCharacter}。\n画面动作与场景：${scene.description}。\n保持角色绝对一致，高质量，电影级画质。`;
      const result = await createSeedreamTask({
        prompt,
        model: job.settings.seedreamModel,
        aspectRatio: "9:16",
        referenceImageUrl: job.referenceImageUrl,
        apiKey: job.settings.arkApiKey,
        baseUrl: job.settings.arkBaseUrl,
      });

      updateScene(jobId, scene.id, (s) => ({ ...s, remoteImageTaskId: result.id, imageStatus: "succeeded", imageUrl: result.imageUrl }));
    } catch (err) {
      imageFailures++;
      updateScene(jobId, scene.id, (s) => ({ ...s, imageStatus: "failed", imageError: err instanceof Error ? err.message : "生图失败" }));
    }
  }

  const jobAfterImages = petStore.get(jobId);
  if (!jobAfterImages) return;

  if (imageFailures === jobAfterImages.scenes.length) {
    updateJob(jobId, (j) => ({ ...j, status: "failed", error: "所有底图生成失败" }));
    return;
  }

  updateJob(jobId, (j) => ({ ...j, status: "generating_videos" }));

  // Phase 2: Generate Videos
  let videoFailures = 0;
  for (const scene of jobAfterImages.scenes) {
    const freshJob = petStore.get(jobId);
    const currentScene = freshJob?.scenes.find(s => s.id === scene.id);
    if (currentScene?.videoStatus === "succeeded") continue;
    if (currentScene?.imageStatus !== "succeeded" || !currentScene?.imageUrl) {
      videoFailures++;
      updateScene(jobId, scene.id, (s) => ({ ...s, videoStatus: "failed", videoError: "缺少底图" }));
      continue;
    }

    updateScene(jobId, scene.id, (s) => ({ ...s, videoStatus: "queued", videoError: undefined }));
    try {
      updateScene(jobId, scene.id, (s) => ({ ...s, videoStatus: "running" }));

      const created = await createSeedanceTask({
        prompt: `主角配音说：“${currentScene.subtitle || ""}”。\n动作与运镜：${currentScene.description}，${currentScene.camera}`,
        model: jobAfterImages.settings.seedanceModel,
        ratio: "9:16",
        resolution: "720p",
        duration: currentScene.duration || 5,
        generateAudio: true,
        watermark: false,
        returnLastFrame: false,
        firstFrameUrl: currentScene.imageUrl,
        apiKey: jobAfterImages.settings.arkApiKey,
        baseUrl: jobAfterImages.settings.arkBaseUrl,
      });

      updateScene(jobId, scene.id, (s) => ({ ...s, remoteVideoTaskId: created.id }));
      const result = await pollSeedanceTask(created.id, jobAfterImages.settings.arkApiKey, jobAfterImages.settings.arkBaseUrl);

      if (result.status === "succeeded" && result.videoUrl) {
        updateScene(jobId, scene.id, (s) => ({ ...s, videoStatus: "succeeded", videoUrl: result.videoUrl }));
      } else {
        videoFailures++;
        updateScene(jobId, scene.id, (s) => ({ ...s, videoStatus: "failed", videoError: result.error || `状态: ${result.status}` }));
      }
    } catch (err) {
      videoFailures++;
      updateScene(jobId, scene.id, (s) => ({ ...s, videoStatus: "failed", videoError: err instanceof Error ? err.message : "生成视频失败" }));
    }
  }

  updateJob(jobId, (j) => {
    const hasSuccess = j.scenes.some((s) => s.videoStatus === "succeeded");
    return {
      ...j,
      status: videoFailures > 0 ? (hasSuccess ? "partial_failed" : "failed") : "completed",
      error: videoFailures > 0 ? "部分分镜生成失败" : undefined,
    };
  });
}
