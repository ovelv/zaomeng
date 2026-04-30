import { Suspense } from "react";
import { CustomClient } from "@/components/custom-client";

export const metadata = {
  title: "自定义视频生成 - 造梦工厂",
};

export default function CustomPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomClient />
    </Suspense>
  );
}
