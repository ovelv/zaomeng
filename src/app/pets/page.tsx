import { Suspense } from "react";
import { PetsClient } from "@/components/pets-client";

export const metadata = {
  title: "AI 萌宠视频生成器",
  description: "只需一句话主题，AI 自动扩写多镜头脚本、分镜提示词和配音台词。通过垫图与严格提示词控制，实现极高的萌宠人物连贯性。",
};

export default function PetsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PetsClient />
    </Suspense>
  );
}
