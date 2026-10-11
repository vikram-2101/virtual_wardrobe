import React from "react";
import { LayoutGrid, Shirt } from "lucide-react";
import { ClothingCategory, WardrobeCategorySummary } from "../types";

export interface WardrobeCategoryRowProps {
  categories: WardrobeCategorySummary[];
  selectedCategory: ClothingCategory | "ALL";
  onSelectCategory: (category: ClothingCategory | "ALL") => void;
}

export const WardrobeCategoryRow: React.FC<WardrobeCategoryRowProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 my-2.5">
      {categories.map((cat) => {
        const isActive = selectedCategory === cat.category;

        return (
          <button
            key={cat.category}
            type="button"
            onClick={() => onSelectCategory(cat.category)}
            className={`flex items-center gap-2.5 p-2 sm:p-2.5 rounded-2xl border transition-all text-left focus:outline-none ${
              isActive
                ? "bg-[#F4ECE1] border-ink-primary shadow-xs ring-1 ring-ink-primary/20"
                : "bg-white border-border-light hover:border-border-subtle hover:bg-surface-subtle/40"
            }`}
          >
            {/* Visual Icon / Thumbnail Area */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-subtle/80 flex items-center justify-center overflow-hidden shrink-0">
              {cat.category === "ALL" ? (
                <LayoutGrid
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${
                    isActive ? "text-ink-primary" : "text-ink-secondary"
                  }`}
                />
              ) : cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.label}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <Shirt
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${
                    isActive ? "text-ink-primary" : "text-ink-secondary"
                  }`}
                />
              )}
            </div>

            {/* Label & Item Count */}
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="text-xs font-bold text-ink-primary truncate">
                {cat.label}
              </span>
              <span className="text-[10px] sm:text-[11px] text-ink-muted font-medium">
                {cat.count} {cat.count === 1 ? "item" : "items"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
