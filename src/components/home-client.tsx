"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_CAMERA_TEMPLATE,
  DEFAULT_PERSONA_TEMPLATE,
} from "@/lib/prompt-templates";
import { GenerationJob, SegmentDraft } from "@/lib/types";
import { saveHistory, getHistoryById } from "@/lib/history";
import { getSettings } from "@/lib/settings";

type SegmentResponse = {
  segments: SegmentDraft[];
  summary: {
    count: number;
    totalChars: number;
    totalDurationSec: number;
  };
};

const DEMO_TEXT = `大家好，今天想跟你们聊一个很多人正在忽略的问题。你以为自己做短视频没流量，是因为不够努力，其实很多时候不是。真正拉开差距的，是你有没有把一句话讲清楚，有没有让用户在前三秒停下来。很多账号内容并不复杂，但它开头就能把情绪拉住，然后用非常稳定的节奏把价值讲完。所以如果你也想做一个能持续更新的口播号，第一步不是急着拍，而是先把你的表达拆成适合短视频节奏的段落。接下来我会用一个很简单的方法，带你把长文案变成可以连续发布的多条视频。`;

export function HomeClient() {
  const [text, setText] = useState(DEMO_TEXT);
  const [title, setTitle] = useState("连续口播示例");
  const [assetId, setAssetId] = useState("asset-20260401123823-6d4x2");
  const [personaTemplate, setPersonaTemplate] = useState(DEFAULT_PERSONA_TEMPLATE);
  const [cameraTemplate, setCameraTemplate] = useState(DEFAULT_CAMERA_TEMPLATE);
  const [segments, setSegments] = useState<SegmentDraft[]>([]);
  const [summary, setSummary] = useState<SegmentResponse["summary"] | null>(null);
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [isSplitting, setIsSplitting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState("doubao-seedance-2-0-260128");
  const [duration, setDuration] = useState(15);
  const [generateAudio, setGenerateAudio] = useState(true);
  const [watermark, setWatermark] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle reuseId from query
  useEffect(() => {
    const reuseId = searchParams.get("reuseId");
    if (reuseId) {
      const record = getHistoryById(reuseId);
      if (record && record.type === "oral") {
        const {
          title,
          sourceText,
          assetId,
          personaTemplate,
          cameraTemplate,
          model,
          duration,
          generateAudio,
          watermark,
          segments,
        } = record.data;

        if (title !== undefined) setTitle(title);
        if (sourceText !== undefined) setText(sourceText);
        if (assetId !== undefined) setAssetId(assetId);
        if (personaTemplate !== undefined) setPersonaTemplate(personaTemplate);
        if (cameraTemplate !== undefined) setCameraTemplate(cameraTemplate);
        if (model !== undefined) setModel(model);
        if (duration !== undefined) setDuration(duration);
        if (generateAudio !== undefined) setGenerateAudio(generateAudio);
        if (watermark !== undefined) setWatermark(watermark);
        if (segments !== undefined) setSegments(segments);
        
        // Remove reuseId from URL after loading
        router.replace("/");
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!job || ["completed", "failed", "partial_failed"].includes(job.status)) {
      return;
    }

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/jobs/${job.id}`, { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as { job: GenerationJob };
      setJob(payload.job);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [job]);

  const totalChars = useMemo(() => text.trim().length, [text]);
  const targetTotalDuration = useMemo(
    () =>
      segments.reduce(
        (sum, segment) => sum + (segment.targetDurationSec || segment.estimatedDurationSec),
        0
      ),
    [segments]
  );

  function clampDuration(value: number) {
    return Math.min(15, Math.max(4, Math.round(value || 4)));
  }

  async function handleSplit() {
    setIsSplitting(true);
    setError(null);

    try {
      const response = await fetch("/api/segment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetMin: 60, targetMax: 70 }),
      });
      const payload = (await response.json()) as SegmentResponse | { error: string };
      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "切分失败");
      }
      setSegments(
        payload.segments.map((segment) => ({
          ...segment,
          targetDurationSec: clampDuration(segment.estimatedDurationSec),
        }))
      );
      setSummary(payload.summary);
      setJob(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "切分失败");
    } finally {
      setIsSplitting(false);
    }
  }

  async function handleGenerate() {
    setIsSubmitting(true);
    setError(null);

    try {
      const settings = getSettings();
      const requestBody = {
        title,
        sourceText: text,
        assetId,
        personaTemplate,
        cameraTemplate,
        model,
        duration,
        ratio: "9:16",
        resolution: "720p",
        generateAudio,
        watermark,
        segments,
        settings,
      };

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const payload = (await response.json()) as { job?: GenerationJob; error?: string };
      if (!response.ok || !payload.job) {
        throw new Error(payload.error || "创建任务失败");
      }
      setJob(payload.job);

      // Save to localStorage history
      saveHistory({
        type: "oral",
        title: title || "口播生成任务",
        data: requestBody,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建任务失败");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRetrySegment(segmentId: string) {
    if (!job) return;
    try {
      const response = await fetch(`/api/jobs/${job.id}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segmentId }),
      });
      if (!response.ok) {
        throw new Error("重试请求失败");
      }
      // Force an immediate refresh
      const refresh = await fetch(`/api/jobs/${job.id}`, { cache: "no-store" });
      if (refresh.ok) {
        const payload = await refresh.json();
        setJob(payload.job);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "重试失败");
    }
  }

  function updateSegmentText(id: string, value: string) {
    setSegments((current) =>
      current.map((segment) =>
        segment.id === id
          ? {
              ...segment,
              text: value,
              charCount: value.length,
              estimatedDurationSec: Math.max(4, Math.round(value.length / 4.3)),
            }
          : segment
      )
    );
  }

  function updateSegmentDuration(id: string, value: number) {
    const nextDuration = clampDuration(value);
    setSegments((current) =>
      current.map((segment) =>
        segment.id === id
          ? {
              ...segment,
              targetDurationSec: nextDuration,
            }
          : segment
      )
    );
  }

  function applyDefaultDurationToAllSegments() {
    const nextDuration = clampDuration(duration);
    setSegments((current) =>
      current.map((segment) => ({
        ...segment,
        targetDurationSec: nextDuration,
      }))
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-violet-300">
              Seedance 2.0 V1
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
              连续口播视频生成器
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
              输入长口播文案，自动切分为多个 15 秒左右的短视频口播稿；首段使用火山引擎虚拟人
              <code className="mx-1 rounded bg-white/10 px-2 py-1 text-xs">assetId</code>
              ，每个片段都复用同一套人物设定和口播镜头模板生成，适合直接做抖音连续发布。
            </p>
          </div>
          <div className="grid min-w-[220px] grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
            <div>
              <div className="text-2xl font-semibold text-white">{totalChars}</div>
              <div>当前总字数</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-white">{summary?.count ?? 0}</div>
              <div>预计片段数</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">1. 输入文案与生成参数</h2>
          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm text-slate-300">
              项目标题
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                placeholder="比如：私域运营 5 条连续口播"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-300">
              虚拟人 assetId
              <input
                value={assetId}
                onChange={(event) => setAssetId(event.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                placeholder="例如：asset-20260401123823-6d4x2"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                固定人设模板
                <textarea
                  value={personaTemplate}
                  onChange={(event) => setPersonaTemplate(event.target.value)}
                  className="min-h-[140px] rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-sm leading-7 text-white outline-none transition focus:border-violet-400"
                  placeholder="描述人物气质、表达状态、账号风格"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                固定口播镜头模板
                <textarea
                  value={cameraTemplate}
                  onChange={(event) => setCameraTemplate(event.target.value)}
                  className="min-h-[140px] rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-sm leading-7 text-white outline-none transition focus:border-violet-400"
                  placeholder="描述镜头景别、构图、布光、背景和禁用项"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-300">
              <button
                type="button"
                onClick={() => setPersonaTemplate(DEFAULT_PERSONA_TEMPLATE)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
              >
                重置默认人设
              </button>
              <button
                type="button"
                onClick={() => setCameraTemplate(DEFAULT_CAMERA_TEMPLATE)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
              >
                重置默认镜头
              </button>
            </div>
            <label className="grid gap-2 text-sm text-slate-300">
              长口播文案
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="min-h-[280px] rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-sm leading-7 text-white outline-none transition focus:border-violet-400"
                placeholder="粘贴完整口播内容"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                模型
                <select
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                >
                  <option value="doubao-seedance-2-0-260128">seedance 2.0</option>
                  <option value="doubao-seedance-2-0-fast-260128">
                    seedance 2.0 fast
                  </option>
                </select>
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                批量应用秒数
                <input
                  value={duration}
                  onChange={(event) => setDuration(clampDuration(Number(event.target.value)))}
                  min={4}
                  max={15}
                  type="number"
                  className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-300">
              <button
                type="button"
                onClick={applyDefaultDurationToAllSegments}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
              >
                应用批量秒数到全部分段
              </button>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={generateAudio}
                  onChange={() => setGenerateAudio((value) => !value)}
                />
                生成有声视频
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={watermark}
                  onChange={() => setWatermark((value) => !value)}
                />
                输出水印
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSplit}
                disabled={isSplitting}
                className="rounded-full bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSplitting ? "切分中..." : "先切分文案"}
              </button>
              <button
                onClick={handleGenerate}
                disabled={isSubmitting || segments.length === 0}
                className="rounded-full border border-violet-300/40 bg-white/5 px-5 py-3 text-sm font-medium text-violet-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "创建任务中..." : "启动连续生成"}
              </button>
            </div>
            {error ? (
              <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold text-white">2. 分段结果</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              默认按 60-70 字切分，优先保持语义完整。你可以在这里直接改每一段，系统会按当前内容生成视频。
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                总段数：{summary?.count ?? 0}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                目标总时长：{targetTotalDuration}s
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                总字数：{summary?.totalChars ?? 0}
              </span>
            </div>
            <div className="mt-5 max-h-[620px] space-y-4 overflow-y-auto pr-1">
              {segments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">
                  先点击“先切分文案”，这里会出现可编辑的片段脚本。
                </div>
              ) : (
                <>
                  {segments.map((segment, idx) => (
                    <div
                      key={segment.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 relative"
                    >
                      <button
                        onClick={() => {
                          const newSegments = segments.filter((_, i) => i !== idx);
                          // Re-number remaining segments
                          setSegments(newSegments.map((s, i) => ({ ...s, index: i + 1 })));
                        }}
                        className="absolute right-4 top-4 text-xs text-rose-400 hover:text-rose-300 transition"
                        title="删除此分段"
                      >
                        删除
                      </button>
                      <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                        <span>第 {segment.index} 段</span>
                        <span className="mr-8">
                          {segment.charCount} 字 / 预估 {segment.estimatedDurationSec} 秒 / 生成 {segment.targetDurationSec} 秒
                        </span>
                      </div>
                    <div className="mb-3 grid gap-2 md:grid-cols-[1fr_120px] md:items-end">
                      <div className="text-xs text-slate-400">
                        可为每一段单独设置生成秒数，实际调用以这里的数值为准。
                      </div>
                      <label className="grid gap-1 text-xs text-slate-400">
                        本段秒数
                        <input
                          value={segment.targetDurationSec}
                          onChange={(event) =>
                            updateSegmentDuration(
                              segment.id,
                              Number(event.target.value)
                            )
                          }
                          min={4}
                          max={15}
                          type="number"
                          className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none transition focus:border-violet-400"
                        />
                      </label>
                    </div>
                    <textarea
                      value={segment.text}
                      onChange={(event) => updateSegmentText(segment.id, event.target.value)}
                      className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm leading-7 text-white outline-none transition focus:border-violet-400"
                    />
                  </div>
                ))}
                  <button
                    onClick={() => {
                      const newSegment = {
                        id: crypto.randomUUID(),
                        index: segments.length + 1,
                        text: "",
                        charCount: 0,
                        estimatedDurationSec: 5,
                        targetDurationSec: 5,
                      };
                      setSegments([...segments, newSegment]);
                    }}
                    className="w-full rounded-2xl border border-dashed border-white/20 bg-transparent px-4 py-3 text-sm text-slate-300 transition hover:border-violet-400 hover:text-violet-300"
                  >
                    + 添加新分段
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">3. 任务状态与结果</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              每一段都会使用
              <code className="rounded bg-white/10 px-2 py-1">asset://assetId</code>
              作为人物参考，并叠加同一套固定人设模板和口播镜头模板，独立生成对应的口播视频。
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-slate-300">
            当前任务状态：
            <span className="ml-2 font-medium text-white">{job?.status ?? "未创建"}</span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {!job ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">
              任务创建后，这里会实时显示每一段的 Seedance 执行状态和视频链接。
            </div>
          ) : (
            job.segments.map((segment) => (
              <article
                key={segment.id}
                className="rounded-3xl border border-white/10 bg-slate-950/70 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm text-violet-300">第 {segment.index} 段</div>
                    <h3 className="mt-1 text-base font-medium text-white">{segment.text}</h3>
                  </div>
                  <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                    {segment.status}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Seedance Task
                    </div>
                    <div className="mt-2 break-all text-slate-100">
                      {segment.remoteTaskId || "等待创建"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      生成方式
                    </div>
                    <div className="mt-2 text-slate-100">
                      固定 assetId 独立生成
                    </div>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
                  本段生成秒数：
                  <span className="ml-2 font-medium text-white">
                    {segment.targetDurationSec} 秒
                  </span>
                </div>
                <div className="mt-3 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      固定人设模板
                    </div>
                    <div className="mt-2 max-h-28 overflow-hidden text-slate-100">
                      {job.personaTemplate}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      固定口播镜头模板
                    </div>
                    <div className="mt-2 max-h-28 overflow-hidden text-slate-100">
                      {job.cameraTemplate}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm items-center">
                  {segment.videoUrl ? (
                    <div className="flex flex-col gap-2 w-full mt-2">
                      <video 
                        src={segment.videoUrl} 
                        controls 
                        className="w-full max-w-[280px] rounded-lg object-cover bg-black/20"
                      />
                      <a href={segment.videoUrl} target="_blank" rel="noreferrer" className="text-violet-400 hover:underline">
                        在新标签页打开视频
                      </a>
                    </div>
                  ) : null}
                  {(segment.status === "failed" || segment.status === "succeeded") && (
                    <button
                      onClick={() => handleRetrySegment(segment.id)}
                      className="text-violet-400 hover:underline"
                    >
                      重新生成该片段
                    </button>
                  )}
                </div>
                {segment.error ? (
                  <p className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {segment.error}
                  </p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
