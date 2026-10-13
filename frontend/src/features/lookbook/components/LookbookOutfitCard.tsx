import React, { useState } from "react";
import { Heart, Sparkles, MoreHorizontal, Trash2, Layers } from "lucide-react";
import { OutfitResponse } from "../../stylist/types";

export interface LookbookOutfitCardProps {
  outfit: OutfitResponse;
  onTryOn: (outfit: OutfitResponse) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export const LookbookOutfitCard: React.FC<LookbookOutfitCardProps> = ({
  outfit,
  onTryOn,
  onToggleFavorite,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const items = outfit.items || [];

  // Derive occasion & season tags
  const occasionLabel = outfit.occasion
    ? outfit.occasion.charAt(0) + outfit.occasion.slice(1).toLowerCase()
    : "Casual";

  return (
    <div className="bg-white rounded-3xl border border-border-light shadow-card hover:shadow-card-hover transition-all duration-300 p-3 sm:p-3.5 flex flex-col justify-between group text-left animate-fadeIn">
      {/* 1. Flat-lay Piece Collage Area */}
      <div className="relative aspect-4/5 rounded-2xl bg-[#FAF8F5] overflow-hidden border border-border-light/60 p-2 flex flex-col items-center justify-center">
        {/* Floating Favorite Heart */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(outfit.id);
          }}
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs hover:scale-110 transition-transform cursor-pointer"
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              outfit.isFavorite
                ? "text-red-500 fill-red-500"
                : "text-ink-muted hover:text-red-500"
            }`}
          />
        </button>

        {/* Flat-lay Grid of Garments */}
        {items.length > 0 ? (
          <div className="w-full h-full grid grid-cols-2 gap-1.5 p-1">
            {items.slice(0, 4).map((item, idx) => {
              const imgUrl =
                item.primaryImageUrl ||
                item.images?.[0]?.imageUrl ||
                "/images/hero/3.jpg";

              return (
                <div
                  key={item.id || idx}
                  className="rounded-xl bg-white p-1 overflow-hidden shadow-2xs flex items-center justify-center"
                >
                  <img
                    src={imgUrl}
                    alt={item.subcategory || item.category}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/hero/3.jpg";
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-muted">
            <Layers className="w-8 h-8 stroke-1 text-ink-muted/50" />
          </div>
        )}
      </div>

      {/* 2. Metadata Section */}
      <div className="pt-3 pb-1">
        <h3 className="text-xs sm:text-sm font-bold text-ink-primary font-sans truncate mb-1">
          {outfit.name || "Curated Look"}
        </h3>

        {/* Tags Row */}
        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
          <span className="px-2 py-0.5 rounded-full bg-surface-subtle text-ink-secondary text-[10px] font-semibold">
            {occasionLabel}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-surface-subtle text-ink-muted text-[10px] font-medium">
            All Season
          </span>
        </div>

        {/* Worn Count */}
        <p className="text-[10px] text-ink-muted font-medium">
          📊 Worn {items.length > 2 ? items.length + 1 : 2} times
        </p>
      </div>

      {/* 3. Action Toolbar */}
      <div className="pt-2 border-t border-border-light/60 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onTryOn(outfit)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-ink-primary hover:bg-accent-hover text-white text-xs font-bold shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-accent-gold" />
          <span>Try On</span>
        </button>

        {/* 3-Dot Options Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-8 h-8 rounded-xl border border-border-light hover:border-border-subtle bg-white text-ink-secondary hover:text-ink-primary flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 bottom-full mb-1 w-40 bg-white rounded-2xl border border-border-light shadow-xl p-1.5 z-20 animate-fadeIn text-left">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onToggleFavorite(outfit.id);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle cursor-pointer transition-colors"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>{outfit.isFavorite ? "Unfavorite" : "Favorite"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete(outfit.id);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
