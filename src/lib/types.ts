export type SegmentDraft = {
  id: string;
  index: number;
  text: string;
  charCount: number;
  estimatedDurationSec: number;
  targetDurationSec: number;
};

export type LocalSegmentStatus =
  | "pending"
  | "queued"
  | "running"
  | "succeeded"
  | "failed";

export type SegmentTask = SegmentDraft & {
  status: LocalSegmentStatus;
  remoteTaskId?: string;
  videoUrl?: string;
  lastFrameUrl?: string;
  error?: string;
  prompt?: string;
  startedAt?: string;
  finishedAt?: string;
};

export type JobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "partial_failed";

import { Settings } from "./settings";

export type GenerationJob = {
  id: string;
  sourceText: string;
  assetId: string;
  personaTemplate: string;
  cameraTemplate: string;
  title?: string;
  model: string;
  ratio: "9:16" | "3:4" | "1:1" | "16:9";
  resolution: "720p" | "480p";
  duration: number;
  generateAudio: boolean;
  watermark: boolean;
  status: JobStatus;
  error?: string;
  segments: SegmentTask[];
  settings: Settings;
  createdAt: string;
  updatedAt: string;
};

export type CreateJobInput = {
  sourceText?: string;
  assetId?: string;
  personaTemplate?: string;
  cameraTemplate?: string;
  title?: string;
  model?: string;
  ratio?: "9:16" | "3:4" | "1:1" | "16:9";
  resolution?: "720p" | "480p";
  duration?: number;
  generateAudio?: boolean;
  watermark?: boolean;
  segments?: SegmentDraft[];
  settings: Settings;
};
