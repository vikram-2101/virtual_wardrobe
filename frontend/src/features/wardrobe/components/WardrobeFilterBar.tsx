import React from "react";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { ClothingCategory, SortOption } from "../types";

export interface WardrobeFilterBarProps {
  selectedCategory: ClothingCategory | "ALL";
  onCategoryChange: (category: ClothingCategory | "ALL") => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
  selectedSeason: string;
  onSeasonChange: (season: string) => void;
  selectedStyle: string;
  onStyleChange: (style: string) => void;
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const CATEGORIES: { id: ClothingCategory | "ALL"; label: string }[] = [
  { id: "ALL", label: "All Categories" },
  { id: "TOPS", label: "Tops" },
  { id: "BOTTOMS", label: "Bottoms" },
  { id: "OUTERWEAR", label: "Outerwear" },
  { id: "SHOES", label: "Shoes" },
  { id: "ACCESSORIES", label: "Accessories" },
  { id: "DRESSES", label: "Dresses" },
];

const COLORS = [
  "All Colors",
  "Beige",
  "Black",
  "White",
  "Navy Blue",
  "Blue",
  "Green",
  "Olive",
  "Gray",
  "Brown",
  "Red",
];

const SEASONS = ["All Seasons", "Spring", "Summer", "Fall", "Winter"];
const STYLES = [
  "All Styles",
  "Casual",
  "Smart Casual",
  "Formal",
  "Streetwear",
  "Minimalist",
  "Sporty",
];

export const WardrobeFilterBar: React.FC<WardrobeFilterBarProps> = ({
  selectedCategory,
  onCategoryChange,
  selectedColor,
  onColorChange,
  selectedSeason,
  onSeasonChange,
  selectedStyle,
  onStyleChange,
  selectedSort,
  onSortChange,
}) => {
  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-2.5 my-1 sm:my-1.5">
      {/* Left Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category Select */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) =>
              onCategoryChange(e.target.value as ClothingCategory | "ALL")
            }
            className="appearance-none bg-white text-ink-primary text-xs font-semibold rounded-xl border border-border-light pl-3 pr-7 py-1.5 hover:border-ink-primary/40 focus:outline-none transition-all cursor-pointer shadow-xs"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Color Select */}
        <div className="relative">
          <select
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="appearance-none bg-white text-ink-primary text-xs font-semibold rounded-xl border border-border-light pl-3 pr-7 py-1.5 hover:border-ink-primary/40 focus:outline-none transition-all cursor-pointer shadow-xs"
          >
            {COLORS.map((c) => (
              <option key={c} value={c === "All Colors" ? "" : c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Season Select */}
        <div className="relative">
          <select
            value={selectedSeason}
            onChange={(e) => onSeasonChange(e.target.value)}
            className="appearance-none bg-white text-ink-primary text-xs font-semibold rounded-xl border border-border-light pl-3 pr-7 py-1.5 hover:border-ink-primary/40 focus:outline-none transition-all cursor-pointer shadow-xs"
          >
            {SEASONS.map((s) => (
              <option key={s} value={s === "All Seasons" ? "" : s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Style Select */}
        <div className="relative">
          <select
            value={selectedStyle}
            onChange={(e) => onStyleChange(e.target.value)}
            className="appearance-none bg-white text-ink-primary text-xs font-semibold rounded-xl border border-border-light pl-3 pr-7 py-1.5 hover:border-ink-primary/40 focus:outline-none transition-all cursor-pointer shadow-xs"
          >
            {STYLES.map((st) => (
              <option key={st} value={st === "All Styles" ? "" : st}>
                {st}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Right Sort Dropdown */}
      <div className="relative">
        <select
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="appearance-none bg-white text-ink-primary text-xs font-semibold rounded-xl border border-border-light pl-7 pr-7 py-1.5 hover:border-ink-primary/40 focus:outline-none transition-all cursor-pointer shadow-xs"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="category">Category</option>
          <option value="color">Color</option>
        </select>
        <ArrowUpDown className="w-3 h-3 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
};
