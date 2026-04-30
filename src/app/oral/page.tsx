import { Suspense } from "react";
import { HomeClient } from "@/components/home-client";

export const metadata = {
  title: "连续口播生成器 - 造梦工厂",
};

export default function OralPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeClient />
    </Suspense>
  );
}
