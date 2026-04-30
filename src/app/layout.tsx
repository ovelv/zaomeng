import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import { LogoIcon } from "@/components/logo";

export const metadata: Metadata = {
  metadataBase: new URL("https://zaomeng.91wink.com"),
  title: {
    default: "造梦工厂 - 基于火山引擎大模型的AI视频生成平台",
    template: "%s | 造梦工厂",
  },
  description:
    "基于火山引擎大模型，重塑视频生产力。一键将文案与创意转化为高质量视频。支持专业的连续口播视频、多镜头叙事的 AI 萌宠故事、自动剧本拆解、分镜规划与多模态生成，让视频创作像写字一样简单。",
  keywords: [
    "AI视频生成",
    "视频大模型",
    "火山引擎",
    "Seedance",
    "连续口播",
    "萌宠视频",
    "图生视频",
    "视频生成工具",
    "造梦工厂",
    "多模态大模型",
    "AI视频制作",
  ],
  authors: [{ name: "欧维Ove" }],
  creator: "欧维Ove",
  publisher: "造梦工厂",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://zaomeng.91wink.com/",
    siteName: "造梦工厂",
    title: "造梦工厂 - 基于火山引擎大模型的AI视频生成平台",
    description:
      "一键将文案与创意转化为高质量视频。无论是连续口播视频，还是AI萌宠故事，造梦工厂都能自动完成剧本拆解、分镜规划与多模态生成。",
  },
  twitter: {
    card: "summary_large_image",
    title: "造梦工厂 - AI视频生成平台",
    description: "一键将文案与创意转化为高质量视频，支持连续口播与多镜头叙事。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "造梦工厂",
              url: "https://zaomeng.91wink.com/",
              description: "基于火山引擎大模型，重塑视频生产力。一键将文案与创意转化为高质量视频。",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://zaomeng.91wink.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "造梦工厂",
              applicationCategory: "MultimediaApplication",
              operatingSystem: "Web",
              url: "https://zaomeng.91wink.com/",
              description: "基于火山引擎大模型的AI多模态视频生成平台",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "CNY",
              },
              creator: {
                "@type": "Person",
                name: "欧维Ove",
              },
            }),
          }}
        />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FGGX13PNN3"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FGGX13PNN3');
          `}
        </Script>
      </head>
      <body className="flex flex-col min-h-screen">
        <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 shrink-0">
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
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        {/* Footer */}
        <footer className="border-t border-white/10 py-12 text-center bg-slate-950 shrink-0 mt-auto">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-white/80">
                <LogoIcon className="w-5 h-5 opacity-80" />
                <span className="font-semibold tracking-wide text-lg">造梦工厂</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                <span>作者：欧维Ove</span>
                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                <span>微信：Ovelv2023</span>
              </div>
            </div>

            {/* 致敬栏 */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-400">
              <span className="text-slate-300 font-medium">致敬：</span>
              <a href="https://linux.do/" target="_blank" rel="noopener noreferrer" className="hover:text-violet-300 transition no-underline">Linux.do</a>
              <span className="text-slate-600">|</span>
              <a href="https://91wink.com" target="_blank" rel="noopener noreferrer" className="hover:text-violet-300 transition no-underline">独立开发前线</a>
              <span className="text-slate-600">|</span>
              <a href="https://v2ex.com" target="_blank" rel="noopener noreferrer" className="hover:text-violet-300 transition no-underline">V2ex</a>
              <span className="text-slate-600">|</span>
              <a href="https://www.ruanyifeng.com/blog/" target="_blank" rel="noopener noreferrer" className="hover:text-violet-300 transition no-underline">阮一峰</a>
              <span className="text-slate-600">|</span>
              <a href="https://w2solo.com/" target="_blank" rel="noopener noreferrer" className="hover:text-violet-300 transition no-underline">W2solo</a>
              <span className="text-slate-600">|</span>
              <a href="https://www.volcengine.com/" target="_blank" rel="noopener noreferrer" className="hover:text-violet-300 transition no-underline">火山引擎</a>
            </div>

            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} 造梦工厂. Powered by 火山引擎 Volcengine Ark.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
