import React from "react";
import { Plus, ArrowRight, Shirt } from "lucide-react";
import { WardrobeCategory } from "../types";

export interface WardrobeCategoryGridProps {
  categories: WardrobeCategory[];
  onSelectCategory: (categoryId: string) => void;
  onAddItem: () => void;
  onViewAll: () => void;
}

const DEFAULT_CATEGORIES: WardrobeCategory[] = [
  { id: "tops", name: "Tops", itemCount: 12, imageUrl: "/images/hero/3.jpg" },
  {
    id: "bottoms",
    name: "Bottoms",
    itemCount: 6,
    imageUrl: "/images/hero/2.jpg",
  },
  {
    id: "outerwear",
    name: "Outerwear",
    itemCount: 4,
    imageUrl: "/images/hero/5.jpg",
  },
  { id: "shoes", name: "Shoes", itemCount: 5, imageUrl: "/images/hero/4.jpg" },
  {
    id: "accessories",
    name: "Accessories",
    itemCount: 3,
    imageUrl: "/images/hero/6.jpg",
  },
];

export const WardrobeCategoryGrid: React.FC<WardrobeCategoryGridProps> = ({
  categories = DEFAULT_CATEGORIES,
  onSelectCategory,
  onAddItem,
  onViewAll,
}) => {
  return (
    <div className="w-full text-left my-2.5 sm:my-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base sm:text-lg font-bold text-ink-primary font-sans">
          Your Wardrobe
        </h3>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-ink-secondary hover:text-ink-primary transition-colors group"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Grid of Categories + Add Item */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className="flex flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-white border border-border-light hover:border-border-subtle hover:shadow-card transition-all group text-center focus:outline-none"
          >
            {/* Visual Thumbnail / Icon Container */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-surface-subtle overflow-hidden flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to icon
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <Shirt className="w-6 h-6 text-ink-secondary" />
              )}
            </div>

            {/* Name */}
            <span className="text-xs sm:text-sm font-bold text-ink-primary">
              {cat.name}
            </span>

            {/* Item Count */}
            <span className="text-[10px] sm:text-[11px] text-ink-muted mt-0.5 font-medium">
              {cat.itemCount} {cat.itemCount === 1 ? "item" : "items"}
            </span>
          </button>
        ))}

        {/* Add Item Card */}
        <button
          type="button"
          onClick={onAddItem}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-surface-subtle/40 border-2 border-dashed border-border-subtle hover:border-ink-primary hover:bg-surface-subtle transition-all group text-center min-h-[100px]"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-border-light flex items-center justify-center text-ink-secondary group-hover:text-ink-primary mb-1.5 shadow-xs group-hover:scale-110 transition-transform">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-ink-primary">Add Item</span>
        </button>
      </div>
    </div>
  );
};
