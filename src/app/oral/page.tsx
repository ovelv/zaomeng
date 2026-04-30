import { Suspense } from "react";
import { HomeClient } from "@/components/home-client";

export const metadata = {
  title: "连续口播生成器",
  description: "输入长篇口播文案，系统自动按短视频节奏切分。复用同一数字人与固定镜头模板，保障多集连载画质统一。",
};

export default function OralPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeClient />
    </Suspense>
  );
}
