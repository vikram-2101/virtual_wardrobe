import React from "react";
import { Container } from "../../../components/layout/Container";
import { HeroContent } from "./HeroContent";
import { HeroVisual } from "./HeroVisual";

export interface HeroSectionProps {
  onGetStarted?: () => void;
  onWatchDemo?: () => void;
  onViewAllWardrobe?: () => void;
}

/**
 * Main Landing Page Hero Section Orchestrator.
 */
export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  onWatchDemo,
  onViewAllWardrobe,
}) => {
  return (
    <section className="relative w-full overflow-hidden pt-1 sm:pt-2 pb-8 lg:pt-1 lg:pb-8 bg-canvas">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-[#F7EFE6]/60 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#FAF3EA]/80 to-transparent rounded-full blur-2xl pointer-events-none -z-10" />

      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-8 items-center">
          {/* Left Column: Headline, Copy, CTAs, Features (6 cols) */}
          <div className="lg:col-span-6 xl:col-span-6">
            <HeroContent
              onGetStarted={onGetStarted}
              onWatchDemo={onWatchDemo}
            />
          </div>

          {/* Right Column: Arched Model Visual & Floating Cards (6 cols) */}
          <div className="lg:col-span-6 xl:col-span-6 flex justify-center lg:justify-start lg:-ml-4 xl:-ml-6">
            <HeroVisual onViewAllWardrobe={onViewAllWardrobe} />
          </div>
        </div>
      </Container>
    </section>
  );
};
