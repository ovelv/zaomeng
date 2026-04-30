import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { LogoIcon } from "@/components/logo";

export const metadata: Metadata = {
  title: "造梦工厂",
  description: "基于火山引擎的大模型视频生成工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
          <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 md:px-8">
            <Link href="/" className="group flex items-center gap-2 font-semibold tracking-wide text-white hover:text-violet-300 transition">
              <LogoIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
              <span>造梦工厂</span>
            </Link>
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link href="/oral" className="text-slate-300 hover:text-violet-300 no-underline transition">口播视频</Link>
              <Link href="/pets" className="text-slate-300 hover:text-violet-300 no-underline transition">萌宠视频</Link>
              <Link href="/custom" className="text-slate-300 hover:text-violet-300 no-underline transition">自定义视频</Link>
              <Link href="/history" className="text-slate-300 hover:text-violet-300 no-underline transition">生成记录</Link>
              <Link href="/settings" className="text-slate-300 hover:text-violet-300 no-underline transition">系统设置</Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
