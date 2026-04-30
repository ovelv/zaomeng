import { Suspense } from "react";
import { PetsClient } from "@/components/pets-client";

export const metadata = {
  title: "AI 萌宠视频生成器 - 造梦工厂",
};

export default function PetsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PetsClient />
    </Suspense>
  );
}
