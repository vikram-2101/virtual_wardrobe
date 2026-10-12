import React, { useState } from "react";
import {
  Sparkles,
  Loader2,
  X,
  Plus,
  Clock,
  Shirt,
  Layers,
  Check,
} from "lucide-react";
import { TryOnMode, TryOnDisplayItem } from "../types";
import { OutfitResponse } from "../../stylist/types";
import { WardrobeItem, ClothingCategory } from "../../wardrobe/types";

export interface TryOnSourceSelectorProps {
  tryOnMode: TryOnMode;
  onTryOnModeChange: (mode: TryOnMode) => void;
  outfits: OutfitResponse[];
  selectedOutfit: OutfitResponse | null;
  onSelectOutfit: (outfit: OutfitResponse) => void;
  wardrobeItems: WardrobeItem[];
  selectedGarmentIds: string[];
  onToggleGarment: (itemId: string) => void;
  onRemoveGarment: (itemId: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const TryOnSourceSelector: React.FC<TryOnSourceSelectorProps> = ({
  tryOnMode,
  onTryOnModeChange,
  outfits,
  selectedOutfit,
  onSelectOutfit,
  wardrobeItems,
  selectedGarmentIds,
  onToggleGarment,
  onRemoveGarment,
  onGenerate,
  isGenerating,
}) => {
  const [activeCategory, setActiveCategory] = useState<
    ClothingCategory | "ALL"
  >("ALL");
  const [showItemPicker, setShowItemPicker] = useState(false);

  // Selected items derived from selected outfit or manual garment list
  const activeItems: TryOnDisplayItem[] =
    tryOnMode === "outfit" && selectedOutfit
      ? (selectedOutfit.items || []).map((i) => ({
          id: i.id,
          category: i.category,
          subcategory: i.subcategory,
          color: i.color,
          imageUrl:
            i.primaryImageUrl ||
            i.images?.[0]?.imageUrl ||
            "/images/hero/3.jpg",
        }))
      : wardrobeItems
          .filter((item) => selectedGarmentIds.includes(item.id))
          .map((item) => ({
            id: item.id,
            category: item.category,
            subcategory: item.subcategory,
            color: item.color,
            size: item.size,
            brand: item.brand,
            imageUrl: item.images?.[0]?.imageUrl || "/images/hero/3.jpg",
          }));

  const filteredWardrobe =
    activeCategory === "ALL"
      ? wardrobeItems
      : wardrobeItems.filter((i) => i.category === activeCategory);

  const canGenerate =
    (tryOnMode === "outfit" && (selectedOutfit || activeItems.length > 0)) ||
    (tryOnMode === "single" && selectedGarmentIds.length > 0);

  return (
    <div className="w-full h-full bg-white rounded-3xl border border-border-light shadow-card p-4 sm:p-5 text-left flex flex-col justify-between animate-fadeIn">
      <div>
        <h2 className="text-xs sm:text-sm font-bold text-ink-primary font-sans mb-3">
          1. Select What to Try On
        </h2>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-subtle rounded-2xl border border-border-light mb-4">
          <button
            type="button"
            onClick={() => onTryOnModeChange("outfit")}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tryOnMode === "outfit"
                ? "bg-ink-primary text-white shadow-xs"
                : "text-ink-secondary hover:text-ink-primary hover:bg-white/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Try An Outfit</span>
          </button>

          <button
            type="button"
            onClick={() => onTryOnModeChange("single")}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tryOnMode === "single"
                ? "bg-ink-primary text-white shadow-xs"
                : "text-ink-secondary hover:text-ink-primary hover:bg-white/60"
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Single Garment</span>
          </button>
        </div>

        {/* ── Mode A: Try An Outfit ── */}
        {tryOnMode === "outfit" && (
          <div className="space-y-3.5">
            {/* Outfits List Carousel */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-ink-primary">
                  Choose an outfit
                </span>
                <span className="text-[11px] font-semibold text-ink-muted">
                  {outfits.length} available
                </span>
              </div>

              {outfits.length > 0 ? (
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
                  {outfits.map((outfit) => {
                    const isSelected = selectedOutfit?.id === outfit.id;
                    const firstImage =
                      outfit.items?.[0]?.primaryImageUrl ||
                      outfit.items?.[0]?.images?.[0]?.imageUrl ||
                      "/images/hero/1.jpg";

                    return (
                      <button
                        key={outfit.id}
                        type="button"
                        onClick={() => onSelectOutfit(outfit)}
                        className={`w-16 h-20 sm:w-18 sm:h-22 rounded-2xl border-2 shrink-0 overflow-hidden relative cursor-pointer transition-all p-1 bg-surface-subtle/30 ${
                          isSelected
                            ? "border-ink-primary ring-2 ring-ink-primary/20 shadow-xs scale-[1.02] bg-[#F4ECE1]/40"
                            : "border-border-light hover:border-border-subtle"
                        }`}
                      >
                        <img
                          src={firstImage}
                          alt={outfit.name || "Outfit"}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/images/hero/3.jpg";
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-surface-subtle/50 text-center text-xs text-ink-muted">
                  No outfits found. Go to AI Stylist to generate outfits first!
                </div>
              )}
            </div>

            {/* Selected Items Tray */}
            <div>
              <span className="text-xs font-bold text-ink-primary block mb-2">
                Selected Items ({activeItems.length})
              </span>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {activeItems.map((item) => {
                  const img = item.imageUrl || "/images/hero/3.jpg";
                  return (
                    <div
                      key={item.id}
                      className="relative w-16 h-18 sm:w-18 sm:h-20 rounded-2xl border border-border-light bg-surface-subtle/20 p-1 flex items-center justify-center shrink-0 shadow-2xs group"
                    >
                      <img
                        src={img}
                        alt={item.subcategory || item.category}
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveGarment(item.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ink-primary text-white flex items-center justify-center shadow-xs hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}

                {/* Add / Remove tile */}
                <button
                  type="button"
                  onClick={() => setShowItemPicker(!showItemPicker)}
                  className="w-24 h-18 sm:h-20 rounded-2xl border-2 border-dashed border-border-subtle hover:border-ink-primary flex flex-col items-center justify-center gap-1 shrink-0 text-ink-secondary hover:text-ink-primary text-[11px] font-semibold transition-colors cursor-pointer bg-surface-subtle/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showItemPicker ? "Close" : "Add / Remove"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Mode B: Single Garment / Manual Garment Picker ── */}
        {(tryOnMode === "single" || showItemPicker) && (
          <div className="space-y-3 mt-3 pt-3 border-t border-border-light">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-primary">
                Pick Garments:
              </span>
              <div className="flex items-center gap-1 overflow-x-auto">
                {(
                  ["ALL", "TOPS", "BOTTOMS", "OUTERWEAR", "SHOES"] as const
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      activeCategory === cat
                        ? "bg-ink-primary text-white"
                        : "bg-surface-subtle text-ink-secondary hover:bg-border-light"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
              {filteredWardrobe.map((item) => {
                const isSelected = selectedGarmentIds.includes(item.id);
                const img = item.images?.[0]?.imageUrl || "/images/hero/3.jpg";

                return (
                  <div
                    key={item.id}
                    onClick={() => onToggleGarment(item.id)}
                    className={`relative aspect-square rounded-xl border-2 p-1 cursor-pointer transition-all flex items-center justify-center ${
                      isSelected
                        ? "border-ink-primary bg-[#F4ECE1]/50 shadow-xs"
                        : "border-border-light bg-surface-subtle/30 hover:border-border-subtle"
                    }`}
                  >
                    <img
                      src={img}
                      alt={item.subcategory || item.category}
                      className="w-full h-full object-contain"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-ink-primary text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="mt-4 pt-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !canGenerate}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-ink-primary hover:bg-accent-hover text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Fitting Room Try-On...</span>
            </>
          ) : (
            <>
              <span>Try-On</span>
              <Sparkles className="w-4 h-4 text-accent-gold" />
            </>
          )}
        </button>

        {/* Estimated Time Note */}
        <div className="flex items-center justify-center gap-1.5 text-ink-muted text-[11px] mt-2 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>Estimated time: 15–30 seconds</span>
        </div>
      </div>
    </div>
  );
};
