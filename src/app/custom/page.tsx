import { Suspense } from "react";
import { CustomClient } from "@/components/custom-client";

export const metadata = {
  title: "自定义视频生成",
  description: "面向高级用户，直接输入提示词、配置垫图和数字人资产 ID，自由调整宽高比、分辨率与视频时长，释放 Seedance 大模型的全部潜能。",
};

export default function CustomPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomClient />
    </Suspense>
  );
}
