"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomJob } from "@/lib/custom-store";
import { saveHistory, getHistoryById } from "@/lib/history";
import { getSettings } from "@/lib/settings";

export function CustomClient() {
  const [prompt, setPrompt] = useState("");
  const [firstFrameUrl, setFirstFrameUrl] = useState("");
  const [referenceImageUrl, setReferenceImageUrl] = useState("");
  const [assetId, setAssetId] = useState("");
  const [ratio, setRatio] = useState("9:16");
  const [resolution, setResolution] = useState("720p");
  const [duration, setDuration] = useState(5);
  const [generateAudio, setGenerateAudio] = useState(false);
  const [watermark, setWatermark] = useState(false);

  const [job, setJob] = useState<CustomJob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle reuseId from query
  useEffect(() => {
    const reuseId = searchParams.get("reuseId");
    if (reuseId) {
      const record = getHistoryById(reuseId);
      if (record && record.type === "custom") {
        const {
          prompt,
          firstFrameUrl,
          assetId,
          ratio,
          resolution,
          duration,
          generateAudio,
          watermark,
        } = record.data;

        if (prompt !== undefined) setPrompt(prompt);
        if (firstFrameUrl !== undefined) setFirstFrameUrl(firstFrameUrl);
        if (referenceImageUrl !== undefined) setReferenceImageUrl(referenceImageUrl);
        if (assetId !== undefined) setAssetId(assetId);
        if (ratio !== undefined) setRatio(ratio);
        if (resolution !== undefined) setResolution(resolution);
        if (duration !== undefined) setDuration(duration);
        if (generateAudio !== undefined) setGenerateAudio(generateAudio);
        if (watermark !== undefined) setWatermark(watermark);
        
        router.replace("/custom");
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!job || ["succeeded", "failed"].includes(job.status)) {
      return;
    }
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/custom-jobs/${job.id}`, { cache: "no-store" });
        if (response.ok) {
          const payload = await response.json();
          setJob(payload.job);
        }
      } catch (e) {}
    }, 5000);
    return () => window.clearInterval(timer);
  }, [job]);

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    try {
      const settings = getSettings();
      const requestBody = {
        prompt,
        firstFrameUrl,
        referenceImageUrl,
        assetId,
        ratio,
        resolution,
        duration,
        generateAudio,
        watermark,
        settings,
      };

      const response = await fetch("/api/custom-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "生成任务失败");
      
      setJob(payload.job);

      saveHistory({
        type: "custom",
        title: prompt.slice(0, 20) || "自定义视频生成",
        data: requestBody,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成任务失败");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur md:p-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-violet-300">
          自定义视频生成
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
          随心所欲，一键成片
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base max-w-3xl">
          直接输入提示词、垫图、数字人 Asset ID，灵活调用 Seedance 2.0 强大的多模态视频生成能力。
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold text-white">1. 配置参数</h2>
            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm text-slate-300">
                画面提示词 (必填)
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                  placeholder="例如：赛博朋克风格的城市街道，霓虹灯闪烁，一辆飞行汽车飞过。"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-slate-300">
                  <div className="flex justify-between items-center">
                    <span>参考图片 (仅供风格/角色参考)</span>
                    <label className="cursor-pointer text-xs text-violet-400 hover:text-violet-300 hover:underline">
                      上传图片
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg, image/webp" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) {
                            alert("图片大小不能超过 5MB");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            setReferenceImageUrl(result);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                  <input
                    value={referenceImageUrl}
                    onChange={(e) => setReferenceImageUrl(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                    placeholder="可上传，或输入 https:// / base64..."
                  />
                  {referenceImageUrl && referenceImageUrl.startsWith("data:image") && (
                    <div className="mt-2 aspect-video w-full max-w-[160px] overflow-hidden rounded-xl border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={referenceImageUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </label>
                
                <label className="grid gap-2 text-sm text-slate-300">
                  <div className="flex justify-between items-center">
                    <span>首帧图片 (图生视频)</span>
                    <label className="cursor-pointer text-xs text-violet-400 hover:text-violet-300 hover:underline">
                      上传图片
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg, image/webp" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) {
                            alert("图片大小不能超过 5MB");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            setFirstFrameUrl(result);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                  <input
                    value={firstFrameUrl}
                    onChange={(e) => setFirstFrameUrl(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                    placeholder="可上传，或输入 https:// / base64..."
                  />
                  {firstFrameUrl && firstFrameUrl.startsWith("data:image") && (
                    <div className="mt-2 aspect-video w-full max-w-[160px] overflow-hidden rounded-xl border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={firstFrameUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  数字人 Asset ID (可选)
                  <input
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                    placeholder="asset://..."
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="grid gap-2 text-sm text-slate-300">
                  宽高比
                  <select
                    value={ratio}
                    onChange={(e) => setRatio(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                  >
                    <option value="9:16">9:16 (竖屏)</option>
                    <option value="16:9">16:9 (横屏)</option>
                    <option value="1:1">1:1 (方屏)</option>
                    <option value="3:4">3:4</option>
                    <option value="4:3">4:3</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  分辨率
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                  >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="480p">480p</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  时长 (秒)
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Math.min(15, Math.max(4, Number(e.target.value))))}
                    min={4}
                    max={15}
                    className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-300 mt-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={generateAudio}
                    onChange={() => setGenerateAudio(!generateAudio)}
                  />
                  生成声音
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={watermark}
                    onChange={() => setWatermark(!watermark)}
                  />
                  添加水印
                </label>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className="mt-4 rounded-full bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? "生成中..." : "生成视频"}
              </button>

              {error && <p className="text-rose-400 text-sm mt-2">{error}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">2. 生成结果</h2>
              <div className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-slate-300">
                状态: <span className="font-medium text-white">{job?.status ?? "未开始"}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {!job ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">
                  点击“生成视频”后，将在此展示结果。
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 flex flex-col">
                  {job.videoUrl ? (
                    <div className="flex flex-col gap-3">
                      <video src={job.videoUrl} controls className="w-full rounded-lg object-cover" />
                      <a href={job.videoUrl} target="_blank" rel="noreferrer" className="text-violet-400 text-sm text-center hover:underline">
                        在新标签页下载视频
                      </a>
                    </div>
                  ) : (
                    <div className="flex-1 min-h-[300px] bg-black/20 rounded-lg flex flex-col items-center justify-center text-sm text-slate-500 text-center px-4">
                      {job.error ? (
                        <span className="text-rose-400">{job.error}</span>
                      ) : (
                        "正在排队或生成中，请稍候..."
                      )}
                    </div>
                  )}
                  {job.remoteTaskId && (
                    <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-500">
                      Task ID: {job.remoteTaskId}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}