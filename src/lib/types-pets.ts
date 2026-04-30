import { Settings } from "./settings";

export type StoryboardScene = {
  id: string;
  scene: number;
  description: string;
  camera: string;
  subtitle: string;
  duration: number;
  
  remoteImageTaskId?: string;
  imageStatus: "pending" | "generating" | "succeeded" | "failed";
  imageUrl?: string;
  imageError?: string;

  remoteVideoTaskId?: string;
  videoStatus: "pending" | "queued" | "generating" | "running" | "succeeded" | "failed";
  videoUrl?: string;
  videoError?: string;
};

export type PetJobStatus = "draft" | "generating_images" | "generating_videos" | "completed" | "failed" | "partial_failed";

export type PetJob = {
  id: string;
  theme: string;
  globalCharacter: string;
  referenceImageUrl?: string;
  scenes: StoryboardScene[];
  status: "generating_images" | "generating_videos" | "succeeded" | "failed" | "completed" | "partial_failed";
  createdAt: string;
  updatedAt: string;
  error?: string;
  settings: Settings;
};
