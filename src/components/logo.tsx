import { Aperture } from "lucide-react";

export function LogoIcon({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Aperture className="absolute w-full h-full text-violet-500 animate-spin-slow" style={{ animationDuration: '8s' }} />
      <div className="absolute w-[40%] h-[40%] bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
    </div>
  );
}
