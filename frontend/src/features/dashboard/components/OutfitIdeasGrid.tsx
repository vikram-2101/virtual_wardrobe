import React, { useState } from "react";
import { ArrowRight, Heart } from "lucide-react";
import { OutfitIdea } from "../types";

export interface OutfitIdeasGridProps {
  outfits?: OutfitIdea[];
  onOutfitClick?: (outfitId: string) => void;
  onViewAll?: () => void;
}

const DEFAULT_OUTFITS: OutfitIdea[] = [
  {
    id: "outfit_1",
    title: "Casual Day Out",
    tags: ["Casual", "Minimal"],
    imageUrl: "/images/hero/1.jpg",
  },
  {
    id: "outfit_2",
    title: "Street Style",
    tags: ["Streetwear", "Bold"],
    imageUrl: "/images/hero/2.jpg",
  },
  {
    id: "outfit_3",
    title: "Coffee Meetup",
    tags: ["Casual", "Relaxed"],
    imageUrl: "/images/hero/3.jpg",
  },
  {
    id: "outfit_4",
    title: "Smart Casual",
    tags: ["Classic", "Timeless"],
    imageUrl: "/images/hero/4.jpg",
  },
];

export const OutfitIdeasGrid: React.FC<OutfitIdeasGridProps> = ({
  outfits = DEFAULT_OUTFITS,
  onOutfitClick,
  onViewAll,
}) => {
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full text-left my-6 sm:my-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-ink-primary font-sans">
            Outfit Ideas for You
          </h3>
          <p className="text-[11px] sm:text-xs text-ink-secondary mt-0.5">
            Curated by AI based on your style
          </p>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-ink-secondary hover:text-ink-primary transition-colors group"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Grid of Outfit Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {outfits.map((outfit) => {
          const isLiked = likedMap[outfit.id];

          return (
            <div
              key={outfit.id}
              onClick={() => onOutfitClick && onOutfitClick(outfit.id)}
              className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-xs hover:shadow-card transition-all group cursor-pointer flex flex-col justify-between"
            >
              {/* Image Container with Like Heart */}
              <div className="relative aspect-[3/4] w-full bg-surface-subtle overflow-hidden">
                <img
                  src={outfit.imageUrl}
                  alt={outfit.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Like Button */}
                <button
                  type="button"
                  onClick={(e) => toggleLike(outfit.id, e)}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                  title="Like outfit"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isLiked
                        ? "fill-red-500 text-red-500"
                        : "text-ink-secondary hover:text-ink-primary"
                    }`}
                  />
                </button>
              </div>

              {/* Card Footer Details */}
              <div className="p-3.5 sm:p-4 text-left">
                <h4 className="text-xs sm:text-sm font-bold text-ink-primary mb-2 truncate">
                  {outfit.title}
                </h4>

                <div className="flex flex-wrap gap-1.5">
                  {outfit.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-lg bg-surface-subtle text-ink-secondary text-[10px] sm:text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
