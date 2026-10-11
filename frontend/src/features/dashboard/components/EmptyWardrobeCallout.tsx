import React from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "../../../components/common/Button";

export interface EmptyWardrobeCalloutProps {
  onAddClothing: () => void;
  onExploreDemo?: () => void;
}

export const EmptyWardrobeCallout: React.FC<EmptyWardrobeCalloutProps> = ({
  onAddClothing,
  onExploreDemo,
}) => {
  return (
    <div className="w-full bg-white rounded-3xl sm:rounded-4xl border border-border-light shadow-card p-8 sm:p-12 text-center relative overflow-hidden my-6">
      {/* Background ambient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-64 bg-surface-subtle/80 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
        {/* Playful Cursive Headline */}
        <div className="mb-4 inline-flex flex-col items-center">
          <span className="font-handwriting text-3xl sm:text-4xl lg:text-5xl text-ink-primary font-medium leading-tight">
            Your wardrobe is a blank canvas.
          </span>
          <span className="font-handwriting text-2xl sm:text-3xl text-ink-handwriting mt-1 italic">
            Add your favorite pieces &amp; watch your signature style come to
            life.
          </span>

          <svg
            className="w-40 sm:w-48 h-4 text-ink-handwriting/40 mt-1"
            viewBox="0 0 160 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M4,7 Q80,14 150,5" />
            <path d="M12,12 Q85,17 140,11" />
          </svg>
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed max-w-md mb-6">
          Upload shirts, pants, jackets, or shoes to unlock personalized AI
          outfit recommendations and virtual try-ons tailored to your body fit.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onAddClothing}
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
            className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold shadow-md"
          >
            Add Your First Item
          </Button>

          {onExploreDemo && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onExploreDemo}
              icon={<Sparkles className="w-4 h-4 text-accent-gold" />}
              iconPosition="left"
              className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold"
            >
              View Sample Wardrobe
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
