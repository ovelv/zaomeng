"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PetJob, StoryboardScene } from "@/lib/types-pets";
import { saveHistory, getHistoryById } from "@/lib/history";
import { getSettings } from "@/lib/settings";

export function PetsClient() {
  const [theme, setTheme] = useState("一只戴着红围巾的可爱金毛犬，在魔法森林里寻找宝藏");
  const [globalCharacter, setGlobalCharacter] = useState("一只戴着红围巾的可爱金毛犬，毛发柔顺，眼神灵动");
  const [referenceImageUrl, setReferenceImageUrl] = useState("");
  
  const [scenes, setScenes] = useState<Partial<StoryboardScene>[]>([]);
  const [job, setJob] = useState<PetJob | null>(null);

  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle reuseId from query
  useEffect(() => {
    const reuseId = searchParams.get("reuseId");
    if (reuseId) {
      const record = getHistoryById(reuseId);
      if (record && record.type === "pets") {
        const {
          theme,
          globalCharacter,
          referenceImageUrl,
          scenes,
        } = record.data;

        if (theme !== undefined) setTheme(theme);
        if (globalCharacter !== undefined) setGlobalCharacter(globalCharacter);
        if (referenceImageUrl !== undefined) setReferenceImageUrl(referenceImageUrl);
        if (scenes !== undefined) setScenes(scenes);
        
        // Remove reuseId from URL after loading
        router.replace("/pets");
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!job || ["completed", "failed", "partial_failed"].includes(job.status)) {
      return;
    }
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/pets-jobs/${job.id}`, { cache: "no-store" });
        if (response.ok) {
          const payload = await response.json();
          setJob(payload.job);
        }
      } catch (e) {}
    }, 5000);
    return () => window.clearInterval(timer);
  }, [job]);

  async function handleRetryScene(sceneId: string, type: "image" | "video" | "both") {
    if (!job) return;
    try {
      const response = await fetch(`/api/pets-jobs/${job.id}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneId, type }),
      });
      if (!response.ok) {
        throw new Error("重试请求失败");
      }
      const refresh = await fetch(`/api/pets-jobs/${job.id}`, { cache: "no-store" });
      if (refresh.ok) {
        const payload = await refresh.json();
        setJob(payload.job);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "重试失败");
    }
  }

  async function handleGenerateScript() {
    setIsGeneratingScript(true);
    setError(null);
    setScenes([]);
    try {
      const settings = getSettings();
      const response = await fetch("/api/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, settings }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "生成脚本失败");
      
      setScenes(payload.storyboard || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成脚本失败");
    } finally {
      setIsGeneratingScript(false);
    }
  }

  async function handleGenerateVideo() {
    setIsGeneratingVideo(true);
    setError(null);
    try {
      const settings = getSettings();
      const requestBody = {
        theme,
        globalCharacter,
        referenceImageUrl: referenceImageUrl.trim() || undefined,
        scenes,
        settings,
      };

      const response = await fetch("/api/pets-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "生成任务失败");
      
      setJob(payload.job);

      // Save to localStorage history
      saveHistory({
        type: "pets",
        title: theme || "萌宠生成任务",
        data: requestBody,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成任务失败");
    } finally {
      setIsGeneratingVideo(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur md:p-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-violet-300">
          AI 萌宠视频生成器
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
          多镜头叙事与一致性角色
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base max-w-3xl">
          通过大模型自动生成分镜脚本，结合火山引擎文生图/图生视频能力，
          实现固定角色穿搭、多镜头视角的连续萌宠短视频。
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold text-white">1. 全局设定与脚本</h2>
            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm text-slate-300">
                内容主题
                <textarea
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="min-h-[100px] rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                  placeholder="输入故事主题"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                全局角色设定 (确保一致性)
                <textarea
                  value={globalCharacter}
                  onChange={(e) => setGlobalCharacter(e.target.value)}
                  className="min-h-[100px] rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                  placeholder="例如：一只戴着红围巾的金毛犬"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                主角垫图 URL (可选，提供极高一致性)
                <input
                  value={referenceImageUrl}
                  onChange={(e) => setReferenceImageUrl(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                  placeholder="https://... 或 asset://..."
                />
              </label>

              <button
                onClick={() => {
                  const newScene: Partial<StoryboardScene> = {
                    scene: scenes.length + 1,
                    description: "",
                    camera: "推镜头，高质量",
                    subtitle: "",
                    duration: 5,
                  };
                  setScenes([...scenes, newScene]);
                }}
                className="mt-4 w-full rounded-xl border border-dashed border-white/20 bg-transparent px-4 py-3 text-sm text-slate-300 transition hover:border-violet-400 hover:text-violet-300"
              >
                + 添加新分镜
              </button>

              <button
                onClick={handleGenerateScript}
                disabled={isGeneratingScript || !theme}
                className="mt-2 rounded-full bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingScript ? "AI 正在编剧..." : "第一步：生成分镜脚本"}
              </button>

              {error && <p className="text-rose-400 text-sm mt-2">{error}</p>}
            </div>
          </div>

          {scenes.length > 0 && (
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur">
              <h2 className="text-xl font-semibold text-white">2. 分镜脚本预览</h2>
              <div className="mt-4 space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {scenes.map((scene, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-violet-300">分镜 {scene.scene}</div>
                      <button
                        onClick={() => {
                          const newScenes = scenes.filter((_, i) => i !== idx);
                          // Re-number remaining scenes
                          setScenes(newScenes.map((s, i) => ({ ...s, scene: i + 1 })));
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 transition"
                        title="删除此分镜"
                      >
                        删除
                      </button>
                    </div>
                    <label className="grid gap-1 text-xs text-slate-400 mb-2">
                      画面描述 (生图提示词)
                      <textarea
                        value={scene.description}
                        onChange={(e) => {
                          const newScenes = [...scenes];
                          newScenes[idx] = { ...newScenes[idx], description: e.target.value };
                          setScenes(newScenes);
                        }}
                        className="min-h-[60px] rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-white outline-none"
                      />
                    </label>
                    <label className="grid gap-1 text-xs text-slate-400 mb-2">
                      运镜与镜头 (生视频提示词)
                      <textarea
                        value={scene.camera}
                        onChange={(e) => {
                          const newScenes = [...scenes];
                          newScenes[idx] = { ...newScenes[idx], camera: e.target.value };
                          setScenes(newScenes);
                        }}
                        className="min-h-[60px] rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-white outline-none"
                      />
                    </label>
                    <label className="grid gap-1 text-xs text-slate-400 mb-2">
                      分镜台词/字幕 (仅做参考记录)
                      <textarea
                        value={scene.subtitle}
                        onChange={(e) => {
                          const newScenes = [...scenes];
                          newScenes[idx] = { ...newScenes[idx], subtitle: e.target.value };
                          setScenes(newScenes);
                        }}
                        className="min-h-[60px] rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-white outline-none"
                        placeholder="后期用于配音或字幕的文案..."
                      />
                    </label>
                    <label className="grid gap-1 text-xs text-slate-400">
                      时长 (秒)
                      <input
                        type="number"
                        value={scene.duration}
                        onChange={(e) => {
                          const newScenes = [...scenes];
                          newScenes[idx] = { ...newScenes[idx], duration: Number(e.target.value) };
                          setScenes(newScenes);
                        }}
                        className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-white outline-none"
                      />
                    </label>
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo}
                className="mt-6 w-full rounded-full border border-violet-300/40 bg-white/5 px-5 py-3 text-sm font-medium text-violet-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingVideo ? "启动中..." : "第二步：一键生成分镜图与视频"}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">3. 生成进度与成果</h2>
              <div className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-slate-300">
                状态: <span className="font-medium text-white">{job?.status ?? "未开始"}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {!job ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">
                  点击“一键生成分镜图与视频”后，将在此展示每段的底图和视频。
                </div>
              ) : (
                job.scenes.map((scene) => (
                  <article key={scene.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                    <div className="mb-3 text-sm text-violet-300">分镜 {scene.scene}</div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                        <div className="flex justify-between items-center mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                          <span>底图生成</span>
                          <span className={scene.imageStatus === "succeeded" ? "text-green-400" : "text-amber-400"}>
                            {scene.imageStatus}
                          </span>
                        </div>
                        {scene.imageUrl ? (
                          <div className="flex flex-col gap-2">
                            <a href={scene.imageUrl} target="_blank" rel="noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={scene.imageUrl} alt="base" className="w-full rounded-lg object-cover" />
                            </a>
                            <button
                              onClick={() => handleRetryScene(scene.id, "image")}
                              className="text-violet-400 text-xs text-center hover:underline"
                            >
                              重新生成底图
                            </button>
                          </div>
                        ) : (
                          <div className="aspect-[9/16] bg-black/20 rounded-lg flex flex-col gap-2 items-center justify-center text-xs text-slate-500">
                            <span>{scene.imageError || "等待中..."}</span>
                            {scene.imageStatus === "failed" && (
                              <button onClick={() => handleRetryScene(scene.id, "image")} className="text-violet-400 hover:underline">
                                重试
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                          <span>视频生成</span>
                          <span className={scene.videoStatus === "succeeded" ? "text-green-400" : "text-amber-400"}>
                            {scene.videoStatus}
                          </span>
                        </div>
                        {scene.videoUrl ? (
                          <div className="flex flex-col flex-1 gap-2">
                            <video src={scene.videoUrl} controls className="w-full rounded-lg object-cover" />
                            <a href={scene.videoUrl} target="_blank" rel="noreferrer" className="text-violet-400 text-xs text-center hover:underline">
                              在新标签页下载视频
                            </a>
                            <button
                              onClick={() => handleRetryScene(scene.id, "video")}
                              className="text-violet-400 text-xs text-center hover:underline"
                            >
                              仅重新生成视频
                            </button>
                            {scene.subtitle && (
                              <div className="mt-auto bg-slate-950/60 p-3 rounded-xl border border-white/5">
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">配音字幕</div>
                                <div className="text-sm text-slate-200">{scene.subtitle}</div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1 min-h-[160px] bg-black/20 rounded-lg flex flex-col gap-2 items-center justify-center text-xs text-slate-500 text-center px-2">
                            <span>{scene.videoError || "等待底图..."}</span>
                            {scene.videoStatus === "failed" && (
                              <button onClick={() => handleRetryScene(scene.id, "video")} className="text-violet-400 hover:underline">
                                重试
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
