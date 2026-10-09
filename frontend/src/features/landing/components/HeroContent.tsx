import React from "react";
import { ArrowRight, Play, Shirt, Sparkles, Camera } from "lucide-react";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { HERO_FEATURES } from "../constants/heroData";

export interface HeroContentProps {
  onGetStarted?: () => void;
  onWatchDemo?: () => void;
}

/**
 * Left column content of the Hero section:
 * - AI Badge
 * - Editorial Headline
 * - Explanatory Paragraph
 * - Dual Call-to-Action Buttons
 * - 3 Core Feature Highlights
 */
export const HeroContent: React.FC<HeroContentProps> = ({
  onGetStarted,
  onWatchDemo,
}) => {
  // Map icon identifiers to their corresponding Lucide React components
  const renderFeatureIcon = (iconType: string) => {
    switch (iconType) {
      case "wardrobe":
        return (
          <Shirt className="w-5 h-5 text-ink-primary" strokeWidth={1.75} />
        );
      case "styling":
        return (
          <Sparkles className="w-5 h-5 text-ink-primary" strokeWidth={1.75} />
        );
      case "tryon":
        return (
          <Camera className="w-5 h-5 text-ink-primary" strokeWidth={1.75} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-start justify-center pt-0 pb-4 lg:py-0 z-10">
      {/* 1. AI Badge */}
      <div className="mb-4">
        <Badge variant="ai">AI POWERED VIRTUAL WARDROBE</Badge>
      </div>

      {/* 2. Editorial Headline (Strict 3 Lines) */}
      <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-bold text-ink-primary leading-[1.12] tracking-tight mb-4 max-w-xl">
        Try New Outfits <br />
        Without Leaving <br />
        Home
      </h1>

      {/* 3. Subtitle / Value Proposition */}
      <p className="text-sm sm:text-base text-ink-secondary leading-relaxed max-w-md mb-6 font-normal">
        Upload your clothes, create your digital self, and see how outfits look
        on you with AI. Your personal style, powered by technology.
      </p>

      {/* 4. Dual Call-to-Actions */}
      <div className="flex flex-wrap items-center gap-3.5 mb-8 sm:mb-10 w-full sm:w-auto">
        <Button
          variant="primary"
          size="md"
          onClick={onGetStarted}
          icon={
            <ArrowRight className="w-4 h-4 ml-0.5 transition-transform group-hover:translate-x-1" />
          }
          iconPosition="right"
          className="w-full sm:w-auto font-semibold px-6 py-3 shadow-md group text-sm sm:text-base"
        >
          Get Started Free
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={onWatchDemo}
          icon={
            <Play className="w-4 h-4 fill-ink-primary text-ink-primary mr-0.5" />
          }
          iconPosition="left"
          className="w-full sm:w-auto font-medium px-5 py-3 text-sm sm:text-base"
        >
          Watch Demo
        </Button>
      </div>

      {/* 5. Feature Highlights Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-3 border-t border-border-light/60 w-full max-w-lg">
        {HERO_FEATURES.map((feature) => (
          <div key={feature.id} className="flex items-start gap-2.5 group">
            <div className="p-1.5 rounded-xl bg-surface-subtle/80 text-ink-primary shrink-0 transition-transform duration-200 group-hover:scale-105">
              {renderFeatureIcon(feature.icon)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-ink-primary tracking-tight font-sans">
                {feature.title}
              </span>
              <span className="text-[11px] text-ink-secondary mt-0.5">
                {feature.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
