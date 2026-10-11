import React, { useState } from "react";
import { Heart, MoreVertical, Trash2, Shirt } from "lucide-react";
import { WardrobeItem } from "../types";

export interface WardrobeCardProps {
  item: WardrobeItem;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onClick?: (item: WardrobeItem) => void;
}

const COLOR_HEX_MAP: Record<string, string> = {
  beige: "#E6DEC8",
  black: "#1A1A1A",
  white: "#F5F5F5",
  navy: "#1E2D4A",
  "navy blue": "#1E2D4A",
  blue: "#4A90E2",
  "light blue": "#9BC4E2",
  green: "#556B2F",
  olive: "#6B7B47",
  "olive green": "#6B7B47",
  gray: "#8A929A",
  grey: "#8A929A",
  brown: "#6E472A",
  tan: "#C49A6C",
  red: "#C0392B",
  burgundy: "#7B1113",
  pink: "#F3C5CB",
  yellow: "#E9C46A",
};

export const WardrobeCard: React.FC<WardrobeCardProps> = ({
  item,
  onDelete,
  onToggleFavorite,
  onClick,
}) => {
  const [isFavorite, setIsFavorite] = useState(item.isFavorite || false);
  const [menuOpen, setMenuOpen] = useState(false);

  const primaryImage =
    item.images?.find((img) => img.viewType === "FRONT")?.imageUrl ||
    item.images?.[0]?.imageUrl;

  const colorKey = item.color?.toLowerCase() || "gray";
  const colorHex = COLOR_HEX_MAP[colorKey] || "#C49A6C";

  // Parse size & brand from notes or default
  const sizeMatch = item.notes?.match(/Size:\s*([^|]+)/);
  const displaySize = sizeMatch ? sizeMatch[1].trim() : item.size || "M";

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (onToggleFavorite) {
      onToggleFavorite(item.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onDelete) {
      onDelete(item.id);
    }
  };

  return (
    <div
      onClick={() => onClick && onClick(item)}
      className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-xs hover:shadow-card transition-all group cursor-pointer flex flex-col justify-between text-left relative"
    >
      {/* Garment Image Area */}
      <div className="relative aspect-square w-full bg-[#F7F4EE]/60 p-3 sm:p-4 flex items-center justify-center overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={item.subcategory || item.category}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-surface-subtle flex items-center justify-center text-ink-muted">
            <Shirt className="w-8 h-8" />
          </div>
        )}

        {/* Top-Right Favorite Heart */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs hover:scale-110 transition-transform focus:outline-none"
          title="Favorite garment"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite
                ? "fill-red-500 text-red-500"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          />
        </button>
      </div>

      {/* Card Info Details */}
      <div className="p-3.5 sm:p-4 bg-white flex flex-col justify-between gap-2.5">
        {/* Title & 3-dot Menu */}
        <div className="flex items-center justify-between gap-1 relative">
          <h4 className="text-xs sm:text-sm font-bold text-ink-primary truncate font-sans">
            {item.subcategory || `${item.color} ${item.category}`}
          </h4>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="w-6 h-6 rounded-md hover:bg-surface-subtle text-ink-muted hover:text-ink-primary flex items-center justify-center transition-colors focus:outline-none"
              title="Item options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 bottom-7 w-32 bg-white rounded-xl shadow-floating border border-border-light py-1 z-30 animate-fadeIn">
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tags Row: Color Dot + Category Pill + Size Pill */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Color Dot Swatch */}
          <div
            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-xs"
            style={{ backgroundColor: colorHex }}
            title={item.color}
          />

          {/* Category Badge */}
          <span className="px-2 py-0.5 rounded-md bg-surface-subtle text-ink-secondary text-[10px] sm:text-[11px] font-semibold capitalize">
            {item.category.toLowerCase()}
          </span>

          {/* Size Badge */}
          {displaySize && (
            <span className="px-2 py-0.5 rounded-md bg-surface-subtle text-ink-secondary text-[10px] sm:text-[11px] font-semibold">
              {displaySize}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
