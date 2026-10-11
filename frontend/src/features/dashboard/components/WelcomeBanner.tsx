import React from "react";
import { Sparkles, UserCheck } from "lucide-react";
import { Button } from "../../../components/common/Button";

export interface WelcomeBannerProps {
  userName: string;
  onTryOn: () => void;
  onGenerate: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  userName,
  onTryOn,
  onGenerate,
}) => {
  // Get time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING,";
    if (hour < 18) return "GOOD AFTERNOON,";
    return "GOOD EVENING,";
  };

  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl bg-[#F6F1EA] border border-[#ECE4D8] px-6 sm:px-8 lg:px-10 py-6 sm:py-7 overflow-hidden text-left shadow-xs">
      {/* Background Soft Gradients */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-56 h-56 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-surface-subtle rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-6">
        {/* Left: greeting + name + description */}
        <div className="min-w-0">
          {/* Greeting Subtitle */}
          <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-ink-secondary uppercase block mb-1">
            {getGreeting()}
          </span>

          {/* User Name in Serif */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-ink-primary font-normal tracking-tight leading-tight mb-1.5">
            {userName} 👋
          </h1>

          {/* Tagline */}
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed max-w-sm mb-5 font-sans">
            Your wardrobe, powered by AI. Try on clothes, get outfit ideas, and
            discover new styles — all in one place.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={onTryOn}
              icon={<UserCheck className="w-4 h-4" />}
              iconPosition="left"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm"
            >
              <span>Try On an Outfit</span>
              {/* <ArrowRight className="w-3.5 h-3.5 ml-1.5" /> */}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onGenerate}
              icon={<Sparkles className="w-4 h-4 text-accent-gold" />}
              iconPosition="left"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/80 hover:bg-white"
            >
              Generate with AI
            </Button>
          </div>
        </div>

        {/* Right: decorative handwriting */}
        {/* <div className="hidden lg:flex flex-col items-center shrink-0 select-none pointer-events-none rotate-3 opacity-70">
          <span className="font-handwriting text-2xl lg:text-3xl text-ink-handwriting font-medium leading-snug text-right">
            Same you.
            <br />
            <span className="text-xl lg:text-2xl">New possibilities.</span>
          </span>
          <svg
            className="w-7 h-7 text-ink-handwriting/50 mt-1 transform -rotate-45"
            viewBox="0 0 40 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10,10 C20,15 28,25 30,35" />
            <path d="M22,33 L30,35 L32,27" />
          </svg>
        </div> */}
      </div>
    </div>
  );
};
