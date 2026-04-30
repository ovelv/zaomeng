"use client";

import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "@/lib/settings";

export function SettingsClient() {
  const [arkApiKey, setArkApiKey] = useState("");
  const [arkBaseUrl, setArkBaseUrl] = useState("");
  const [seedanceModel, setSeedanceModel] = useState("");
  const [seedreamModel, setSeedreamModel] = useState("");
  const [storyboardModel, setStoryboardModel] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const settings = getSettings();
    setArkApiKey(settings.arkApiKey);
    setArkBaseUrl(settings.arkBaseUrl);
    setSeedanceModel(settings.seedanceModel);
    setSeedreamModel(settings.seedreamModel);
    setStoryboardModel(settings.storyboardModel);
    setGeminiApiKey(settings.geminiApiKey);
  }, []);

  function handleSave() {
    saveSettings({
      arkApiKey,
      arkBaseUrl,
      seedanceModel,
      seedreamModel,
      storyboardModel,
      geminiApiKey,
    });
    setSavedMessage("保存成功！");
    setTimeout(() => setSavedMessage(""), 3000);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur md:p-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">系统设置</h1>
        <p className="text-sm text-slate-400 mb-8">
          配置您自己的 API Key 与模型端点，配置将保存在本地缓存。请确保各项配置均已填写，系统不再回退使用默认环境变量。
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-slate-300 md:col-span-2">
            <div className="flex justify-between items-center">
              <span>ARK_API_KEY</span>
            </div>
            <input
              type="password"
              value={arkApiKey}
              onChange={(e) => setArkApiKey(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
              placeholder="sk-..."
            />
            <p className="text-xs text-slate-500">火山引擎鉴权密钥。</p>
          </label>

          <label className="grid gap-2 text-sm text-slate-300 md:col-span-2">
            <div className="flex justify-between items-center">
              <span>ARK_BASE_URL</span>
            </div>
            <input
              type="text"
              value={arkBaseUrl}
              onChange={(e) => setArkBaseUrl(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
              placeholder="https://ark.cn-beijing.volces.com/api/v3"
            />
            <p className="text-xs text-slate-500">火山引擎接口基础地址，通常不需要修改。</p>
          </label>

          <label className="grid gap-2 text-sm text-slate-300">
            <div className="flex justify-between items-center">
              <span>SEEDANCE_MODEL</span>
            </div>
            <input
              type="text"
              value={seedanceModel}
              onChange={(e) => setSeedanceModel(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
              placeholder="ep-..."
            />
            <p className="text-xs text-slate-500">用于视频生成的 Endpoint ID。</p>
          </label>

          <label className="grid gap-2 text-sm text-slate-300">
            <div className="flex justify-between items-center">
              <span>SEEDREAM_MODEL</span>
            </div>
            <input
              type="text"
              value={seedreamModel}
              onChange={(e) => setSeedreamModel(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
              placeholder="ep-..."
            />
            <p className="text-xs text-slate-500">用于底图生成的 Endpoint ID。</p>
          </label>

          <label className="grid gap-2 text-sm text-slate-300">
            <div className="flex justify-between items-center">
              <span>STORYBOARD_MODEL</span>
            </div>
            <input
              type="text"
              value={storyboardModel}
              onChange={(e) => setStoryboardModel(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
              placeholder="ep-..."
            />
            <p className="text-xs text-slate-500">用于生成分镜脚本的语言模型 Endpoint ID (如 doubao-pro)。</p>
          </label>

          <label className="grid gap-2 text-sm text-slate-300">
            <div className="flex justify-between items-center">
              <span>GEMINI_API_KEY</span>
            </div>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400"
              placeholder="AIza..."
            />
            <p className="text-xs text-slate-500">保留配置项。</p>
          </label>

          <div className="mt-4 flex items-center gap-4 md:col-span-2">
            <button
              onClick={handleSave}
              className="rounded-full bg-violet-500 px-8 py-3 text-sm font-medium text-white transition hover:bg-violet-400"
            >
              保存配置
            </button>
            {savedMessage && <span className="text-sm text-green-400">{savedMessage}</span>}
          </div>
        </div>
      </section>
    </main>
  );
}
