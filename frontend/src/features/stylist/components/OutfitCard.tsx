import React, { useState } from "react";
import {
  Heart,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  MoreVertical,
  RotateCcw,
  Trash2,
  Shirt,
} from "lucide-react";
import { OutfitResponse } from "../types";

export interface OutfitCardProps {
  outfit: OutfitResponse;
  onTryOn: (outfit: OutfitResponse) => void;
  onSave: (id: string) => void;
  onRegenerate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  onTryOn,
  onSave,
  onRegenerate,
  onDelete,
  onToggleFavorite,
}) => {
  const [isFavorite, setIsFavorite] = useState(outfit.isFavorite || false);
  const [isSaved, setIsSaved] = useState(outfit.status === "SAVED");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (onToggleFavorite) {
      onToggleFavorite(outfit.id);
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(true);
    onSave(outfit.id);
  };

  return (
    <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-xs hover:shadow-card transition-all group flex flex-col justify-between text-left relative">
      {/* 1. Flat-lay / Collage Image Container */}
      <div className="relative aspect-[4/5] w-full bg-[#F7F4EE]/60 p-3 flex items-center justify-center overflow-hidden">
        {outfit.items && outfit.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-1.5 w-full h-full p-1">
            {outfit.items.slice(0, 4).map((item, idx) => {
              const imgUrl = item.primaryImageUrl || item.images?.[0]?.imageUrl;
              return (
                <div
                  key={item.id || idx}
                  className="rounded-xl bg-white/90 border border-border-light/60 overflow-hidden flex items-center justify-center p-1"
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={item.subcategory || item.category}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Shirt className="w-5 h-5 text-ink-muted" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-surface-subtle flex items-center justify-center text-ink-muted">
            <Sparkles className="w-7 h-7 text-accent-gold" />
          </div>
        )}

        {/* Top-Right Favorite Heart */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs hover:scale-110 transition-transform focus:outline-none"
          title="Favorite outfit"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isFavorite
                ? "fill-red-500 text-red-500"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          />
        </button>
      </div>

      {/* 2. Info Footer */}
      <div className="p-3.5 bg-white flex flex-col gap-2.5">
        {/* Title & 3-dots Menu */}
        <div className="flex items-center justify-between gap-1 relative">
          <h4 className="text-xs sm:text-sm font-bold text-ink-primary truncate font-sans">
            {outfit.name || "Styled Outfit"}
          </h4>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="w-5 h-5 rounded-md hover:bg-surface-subtle text-ink-muted hover:text-ink-primary flex items-center justify-center transition-colors focus:outline-none"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 bottom-6 w-36 bg-white rounded-xl shadow-floating border border-border-light py-1 z-30 animate-fadeIn text-xs">
                {onRegenerate && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onRegenerate(outfit.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-surface-subtle text-ink-primary text-left"
                  >
                    <RotateCcw className="w-3 h-3 text-ink-secondary" />
                    <span>Regenerate</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete(outfit.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 text-left"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1 flex-wrap">
          {outfit.occasion && (
            <span className="px-2 py-0.5 rounded-md bg-surface-subtle text-ink-secondary text-[10px] font-semibold capitalize">
              {outfit.occasion.toLowerCase()}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-surface-subtle text-ink-secondary text-[10px] font-semibold">
            {outfit.items?.length || 0} pieces
          </span>
        </div>

        {/* Action Buttons: Try On & Save */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border-light/60">
          <button
            type="button"
            onClick={() => onTryOn(outfit)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-ink-primary hover:bg-accent-hover text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-3 h-3 text-accent-gold" />
            <span>Try On</span>
          </button>

          <button
            type="button"
            onClick={handleSaveClick}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
              isSaved
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "border-border-light hover:bg-surface-subtle text-ink-primary"
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3 h-3 text-emerald-600" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3 h-3 text-ink-secondary" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
