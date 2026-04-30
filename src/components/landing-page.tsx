"use client";

import Link from "next/link";
import { Sparkles, Video, History, Wand2, ArrowRight, PlayCircle, Layers, Zap, Volume2, VolumeX } from "lucide-react";
import { useState, useRef } from "react";

import { LogoIcon } from "@/components/logo";

const SHOWCASE_VIDEOS = [
  "https://r5.onionai.so/videos/02177754766654600000000000000000000ffffac1838828ac57e.mp4",
  "https://r5.onionai.so/videos/4%E6%9C%8825%E6%97%A5.mp4",
  "https://r5.onionai.so/videos/4%E6%9C%8825%E6%97%A5%20(1).mp4",
  "https://r5.onionai.so/videos/proxy%20(1).mp4",
  "https://r5.onionai.so/videos/cgt-20260414235326-bx4pk.mp4",
  "https://r5.onionai.so/videos/02177754857771200000000000000000000ffffac192f97b02aa3.mp4",
  "https://r5.onionai.so/videos/02177754822142800000000000000000000ffffac190db0b047fe.mp4",
  "https://r5.onionai.so/videos/dance02.mp4",
];

function VideoCard({ src }: { src: string }) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative group break-inside-avoid overflow-hidden rounded-2xl bg-slate-900 border border-white/10 shadow-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300 hover:-translate-y-1">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-auto object-cover block"
        autoPlay
        loop
        muted={isMuted}
        playsInline
        controls={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-sm text-white font-medium">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span>AI 生成</span>
          </div>
          <button
            onClick={toggleMute}
            className="rounded-full bg-black/50 p-2 text-white hover:bg-violet-500/80 transition-colors backdrop-blur-sm"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-slate-950 text-white">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-24 pb-20 lg:pt-36 lg:pb-28">
          {/* Enhanced Background */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-40"></div>
          <div className="absolute top-1/4 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 blur-[120px]">
            <div className="h-[300px] w-[600px] sm:h-[400px] sm:w-[800px] rounded-full bg-gradient-to-r from-violet-600/40 to-fuchsia-600/40 opacity-60 mix-blend-screen animate-pulse"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300 mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                <Sparkles className="h-4 w-4" />
                <span>基于火山引擎大模型，重塑视频生产力</span>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-8 bg-gradient-to-br from-white via-white to-slate-500 bg-clip-text text-transparent drop-shadow-sm">
                一键将文案与创意 <br className="hidden sm:block" />
                转化为高质量视频
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-300 mb-10 font-light">
                无论是专业的连续口播视频，还是多镜头叙事的 AI 萌宠故事，造梦工厂都能帮您自动完成剧本拆解、分镜规划与多模态生成，让视频创作像写字一样简单。
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/oral"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold text-slate-950 transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]"
                >
                  开始口播创作
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/pets"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/40 shadow-lg"
                >
                  体验萌宠故事
                  <Wand2 className="h-4 w-4 text-violet-300 transition-transform group-hover:rotate-12" />
                </Link>
                <Link
                  href="/custom"
                  className="group inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-medium text-slate-300 transition-all hover:text-white hover:bg-white/5"
                >
                  自定义视频
                  <PlayCircle className="h-4 w-4" />
                </Link>
              </div>
            </div>
            
            {/* Abstract UI Mockup */}
            <div className="mx-auto mt-16 max-w-5xl sm:mt-24">
              <div className="relative rounded-2xl bg-slate-900/50 p-2 ring-1 ring-white/10 backdrop-blur-xl lg:rounded-3xl lg:p-4 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent opacity-50"></div>
                <div className="relative rounded-xl overflow-hidden border border-white/5 bg-slate-950/80 shadow-inner">
                  <div className="flex items-center gap-2 border-b border-white/5 bg-slate-900/50 px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-rose-500/80"></div>
                      <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
                      <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
                    </div>
                    <div className="mx-auto rounded-md bg-slate-800/50 px-3 py-1 text-[10px] text-slate-400">zaomeng-generator.ai</div>
                  </div>
                  <div className="p-6 sm:p-10 grid gap-6 md:grid-cols-3">
                    <div className="space-y-4 md:col-span-1">
                      <div className="h-4 w-1/3 rounded bg-slate-800 animate-pulse"></div>
                      <div className="h-24 rounded-lg border border-white/5 bg-slate-800/50 p-3">
                        <div className="h-2 w-full rounded bg-slate-700/50 mb-2"></div>
                        <div className="h-2 w-4/5 rounded bg-slate-700/50 mb-2"></div>
                        <div className="h-2 w-2/3 rounded bg-slate-700/50"></div>
                      </div>
                      <div className="h-10 rounded-lg bg-violet-600/80"></div>
                    </div>
                    <div className="md:col-span-2 h-48 sm:h-auto rounded-lg border border-white/5 bg-slate-800/30 flex items-center justify-center relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 opacity-30"></div>
                       <PlayCircle className="h-12 w-12 text-white/40 relative z-10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Showcase Section */}
        <section className="py-24 bg-slate-950">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                由造梦工厂创造的无限可能
              </h2>
              <p className="mt-4 text-slate-400">
                浏览这些由火山引擎 Seedance 强力驱动的生成案例。
              </p>
            </div>

            <div className="mx-auto max-w-6xl columns-1 sm:columns-2 lg:columns-4 gap-6 space-y-6">
              {SHOWCASE_VIDEOS.map((src, idx) => (
                <VideoCard key={idx} src={src} />
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-slate-900/50 border-y border-white/5">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                为创作者打造的核心工具
              </h2>
              <p className="mt-4 text-slate-400">
                不再受限于拍摄场地与设备，AI 为您提供无限可能。
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2">
              {/* Feature 1 */}
              <div className="group relative flex flex-col gap-6 rounded-3xl border border-white/10 bg-slate-950/50 p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/50 hover:bg-slate-900/80 hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.2)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 transition-transform duration-300 group-hover:scale-110">
                  <Video className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-violet-200 transition-colors">连续口播拆解</h3>
                  <p className="text-sm leading-6 text-slate-400">
                    输入长篇口播文案，系统自动按短视频节奏切分为 15 秒短片。复用同一数字人与固定镜头模板，保障多集连载画质统一。
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative flex flex-col gap-6 rounded-3xl border border-white/10 bg-slate-950/50 p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:bg-slate-900/80 hover:shadow-[0_10px_40px_-10px_rgba(217,70,239,0.2)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 transition-transform duration-300 group-hover:scale-110">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-fuchsia-200 transition-colors">AI 萌宠编剧</h3>
                  <p className="text-sm leading-6 text-slate-400">
                    只需一句话主题，AI 自动扩写多镜头脚本、分镜提示词和配音台词。通过垫图与严格提示词控制，实现极高的人物连贯性。
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative flex flex-col gap-6 rounded-3xl border border-white/10 bg-slate-950/50 p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/50 hover:bg-slate-900/80 hover:shadow-[0_10px_40px_-10px_rgba(14,165,233,0.2)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-transform duration-300 group-hover:scale-110">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-sky-200 transition-colors">自定义生成引擎</h3>
                  <p className="text-sm leading-6 text-slate-400">
                    面向高级用户，直接输入提示词、配置垫图和数字人资产 ID，自由调整宽高比、分辨率与视频时长，释放 Seedance 的全部潜能。
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group relative flex flex-col gap-6 rounded-3xl border border-white/10 bg-slate-950/50 p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:bg-slate-900/80 hover:shadow-[0_10px_40px_-10px_rgba(245,158,11,0.2)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-transform duration-300 group-hover:scale-110">
                  <History className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-amber-200 transition-colors">灵感记录与复用</h3>
                  <p className="text-sm leading-6 text-slate-400">
                    自动将您精心调教的提示词和参数保存至本地，一键恢复先前的生成设置，支持精确到单镜头的报错重试，不浪费每一次生成。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-950"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                极简的创作工作流
              </h2>
              <p className="mt-4 text-slate-400">
                三个步骤，将您的创意从文字变为震撼的视觉呈现。
              </p>
            </div>

            <div className="mx-auto max-w-5xl">
              <div className="grid gap-12 md:grid-cols-3 relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-sky-500/20"></div>
                
                {/* Step 1 */}
                <div className="relative flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl font-bold text-violet-400 shadow-xl mb-6 relative z-10">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">配置创意引擎</h3>
                  <p className="text-sm text-slate-400">设置您专属的 API Key，输入基础的提示词、故事大纲或口播长文案。</p>
                </div>

                {/* Step 2 */}
                <div className="relative flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl font-bold text-fuchsia-400 shadow-xl mb-6 relative z-10">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">AI 自动编排</h3>
                  <p className="text-sm text-slate-400">系统自动拆解镜头、生成分镜底图并匹配最适合的参数，您只需一键确认。</p>
                </div>

                {/* Step 3 */}
                <div className="relative flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl font-bold text-sky-400 shadow-xl mb-6 relative z-10">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">多模态生成与导出</h3>
                  <p className="text-sm text-slate-400">调用火山引擎 Seedance，云端并发渲染带配音的最终视频，实时展示进度。</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center bg-slate-950">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-white/80">
            <LogoIcon className="w-5 h-5 opacity-80" />
            <span className="font-semibold tracking-wide">造梦工厂</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} 造梦工厂. Powered by 火山引擎 Volcengine Ark.
          </p>
        </div>
      </footer>
    </div>
  );
}