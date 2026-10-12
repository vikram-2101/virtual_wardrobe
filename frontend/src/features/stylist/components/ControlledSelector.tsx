import React, { useState } from "react";
import { Sparkles, Loader2, Check } from "lucide-react";
import { ClothingCategory } from "../../wardrobe/types";

export interface ControlledSelectorProps {
  onGenerate: (categories: ClothingCategory[], name?: string) => void;
  isGenerating: boolean;
}

const CATEGORY_CHOICES: {
  id: ClothingCategory;
  label: string;
  imageUrl: string;
}[] = [
  { id: "TOPS", label: "Tops", imageUrl: "/images/hero/3.jpg" },
  { id: "BOTTOMS", label: "Bottoms", imageUrl: "/images/hero/2.jpg" },
  { id: "OUTERWEAR", label: "Outerwear", imageUrl: "/images/hero/5.jpg" },
  { id: "SHOES", label: "Shoes", imageUrl: "/images/hero/4.jpg" },
  { id: "ACCESSORIES", label: "Accessories", imageUrl: "/images/hero/6.jpg" },
];

export const ControlledSelector: React.FC<ControlledSelectorProps> = ({
  onGenerate,
  isGenerating,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<
    ClothingCategory[]
  >(["TOPS", "BOTTOMS", "SHOES"]);
  const [outfitName, setOutfitName] = useState("");

  const toggleCategory = (cat: ClothingCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length === 1) return; // Must have at least 1 category
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleGenerateClick = () => {
    onGenerate(selectedCategories, outfitName || undefined);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-border-light shadow-card p-4 sm:p-5 text-left animate-fadeIn">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* 1. Category Image Cards */}
        <div className="flex-1">
          <span className="text-xs font-bold text-ink-primary block mb-2">
            1. Select Desired Categories:
          </span>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORY_CHOICES.map((cat) => {
              const isChecked = selectedCategories.includes(cat.id);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-20 sm:w-24 shrink-0 flex flex-col items-center p-2 sm:p-2.5 rounded-2xl border transition-all text-center focus:outline-none relative group ${
                    isChecked
                      ? "bg-[#F4ECE1] border-ink-primary shadow-xs ring-1 ring-ink-primary/20"
                      : "bg-surface-subtle/30 border-border-light hover:border-border-subtle hover:bg-surface-subtle"
                  }`}
                >
                  {/* Selected Checkbox Badge */}
                  <div
                    className={`absolute top-2 right-2 w-4 h-4 rounded-md flex items-center justify-center transition-colors ${
                      isChecked
                        ? "bg-ink-primary text-white"
                        : "border border-border-subtle bg-white/90"
                    }`}
                  >
                    {isChecked && <Check className="w-2.5 h-2.5" />}
                  </div>

                  {/* Thumbnail Image Container */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white flex items-center justify-center mb-1.5 overflow-hidden shadow-2xs p-1">
                    <img
                      src={cat.imageUrl}
                      alt={cat.label}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>

                  <span className="text-xs font-bold text-ink-primary truncate w-full">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Custom Name & Generate Button */}
        <div className="lg:border-l lg:border-border-light/70 lg:pl-5 flex flex-col justify-between gap-3 shrink-0 min-w-[240px] sm:min-w-[280px]">
          <div>
            <span className="text-xs font-bold text-ink-primary block mb-1.5">
              2. Name (Optional):
            </span>
            <input
              type="text"
              value={outfitName}
              onChange={(e) => setOutfitName(e.target.value)}
              placeholder="e.g. Summer Weekend Look"
              className="w-full bg-surface-subtle/50 text-ink-primary text-xs rounded-xl border border-border-light focus:border-ink-primary px-3 py-2.5 focus:outline-none transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerateClick}
            disabled={isGenerating || selectedCategories.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-ink-primary hover:bg-accent-hover text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-accent-gold" />
                <span>Generate Outfits ✨</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
