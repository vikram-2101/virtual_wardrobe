import React from "react";
import { FloatingWardrobeCard } from "./FloatingWardrobeCard";
import { TryOnPreviewCard } from "./TryOnPreviewCard";
import { HandDrawnDoodles } from "./HandDrawnDoodles";

export interface HeroVisualProps {
  onViewAllWardrobe?: () => void;
}

/**
 * Right-side hero visual composition featuring:
 * - Arched backdrop shape
 * - Main editorial center model (`main-model.jpg`)
 * - Overlapping Polaroid snapshot (`side-model.jpg`)
 * - Floating "Your Wardrobe" 2x3 grid card
 * - Hand-drawn annotations & directional arrows
 */
export const HeroVisual: React.FC<HeroVisualProps> = ({
  onViewAllWardrobe,
}) => {
  return (
    <div className="relative w-full flex items-center justify-center pt-0 pb-6 lg:py-0 select-none">
      {/* 1. Large Arched Warm Neutral Backdrop */}
      <div className="relative w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[480px] xl:max-w-[530px] aspect-[4/5] flex items-end justify-center">
        {/* Arch Shape Background */}
        <div className="absolute inset-0 bg-[#EFE9DF] rounded-t-[160px] sm:rounded-t-[200px] lg:rounded-t-[240px] rounded-b-[36px] shadow-inner overflow-hidden">
          {/* Subtle gradient highlights */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/5 pointer-events-none" />
        </div>

        {/* 2. Main Center Model Image */}
        <div className="relative z-10 w-[92%] h-[98%] flex items-end justify-center overflow-hidden rounded-t-[150px] sm:rounded-t-[190px] lg:rounded-t-[230px] rounded-b-[32px]">
          <img
            src="/images/hero/main-model.jpg"
            alt="AI Styled Model in tailored blazer and pants"
            className="w-full h-full object-cover object-top filter brightness-[1.02] contrast-[1.02] transition-transform duration-700 hover:scale-[1.02]"
          />
        </div>

        {/* 3. Hand-Drawn Annotation Doodles */}
        <HandDrawnDoodles />

        {/* 4. Overlapping Left Polaroid Card (Try-on Snapshot, raised higher to stay visible) */}
        <div className="absolute bottom-4 -left-2 sm:bottom-6 sm:-left-6 lg:-left-6 xl:-left-8 z-20 transform -rotate-6 transition-transform duration-300 hover:rotate-0">
          <TryOnPreviewCard />
        </div>

        {/* 5. Floating Right "Your Wardrobe" Card */}
        <div className="absolute top-4 sm:top-6 -right-6 sm:-right-8 lg:-right-6 xl:-right-8 translate-x-[70px] sm:translate-x-[90px] lg:translate-x-[100px] z-20 w-[260px] sm:w-[300px] lg:w-[320px] xl:w-[350px]">
          <FloatingWardrobeCard onViewAllClick={onViewAllWardrobe} />
        </div>
      </div>
    </div>
  );
};
