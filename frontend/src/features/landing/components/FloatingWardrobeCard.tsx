import React from "react";
import { ArrowRight } from "lucide-react";
import { HERO_WARDROBE_ITEMS } from "../constants/heroData";

export interface FloatingWardrobeCardProps {
  className?: string;
  onViewAllClick?: () => void;
}

/**
 * Floating "Your Wardrobe" card featuring a 2x3 grid of wardrobe item previews.
 */
export const FloatingWardrobeCard: React.FC<FloatingWardrobeCardProps> = ({
  className = "",
  onViewAllClick,
}) => {
  return (
    <div
      className={`bg-white rounded-3xl p-5 sm:p-6 shadow-floating border border-border-light/80 transition-all duration-300 hover:shadow-2xl ${className}`}
    >
      {/* Header with Title and "View all ->" link */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h3 className="text-base sm:text-lg font-bold text-ink-primary font-sans">
          Your Wardrobe
        </h3>
        <button
          type="button"
          onClick={onViewAllClick}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-ink-secondary hover:text-ink-primary transition-colors group focus:outline-none"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* 2x3 Grid of Garment Image Cards with increased dimensions */}
      <div className="grid grid-cols-3 gap-3 sm:gap-3.5">
        {HERO_WARDROBE_ITEMS.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square bg-[#F8F6F2] rounded-2xl overflow-hidden p-2.5 sm:p-3 flex items-center justify-center border border-border-light/40 transition-all duration-200 hover:border-border-subtle hover:scale-[1.04] hover:shadow-sm"
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
