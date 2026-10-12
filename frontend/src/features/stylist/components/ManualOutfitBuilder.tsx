import React, { useState } from "react";
import { X, Shirt, Loader2, BookmarkCheck } from "lucide-react";
import { WardrobeItem } from "../../wardrobe/types";

export interface ManualOutfitBuilderProps {
  wardrobeItems: WardrobeItem[];
  onSaveOutfit: (name: string, selectedItemIds: string[]) => void;
  isSaving: boolean;
}

export const ManualOutfitBuilder: React.FC<ManualOutfitBuilderProps> = ({
  wardrobeItems,
  onSaveOutfit,
  isSaving,
}) => {
  const [outfitName, setOutfitName] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] =
    useState<string>("ALL");

  const toggleItemSelection = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter((item) => item !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  const selectedItems = wardrobeItems.filter((i) =>
    selectedItemIds.includes(i.id),
  );

  const displayedItems =
    activeCategoryFilter === "ALL"
      ? wardrobeItems
      : wardrobeItems.filter((i) => i.category === activeCategoryFilter);

  const handleSave = () => {
    if (selectedItemIds.length === 0) return;
    onSaveOutfit(outfitName || "Custom Outfit", selectedItemIds);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-border-light shadow-card p-5 sm:p-6 text-left space-y-5 animate-fadeIn">
      {/* 1. Top Selected Summary Strip */}
      <div className="p-4 rounded-2xl bg-[#F7F3EB]/70 border border-[#ECE4D8]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-ink-primary">
              Selected Pieces ({selectedItems.length})
            </h3>
            {/* <p className="text-[11px] text-ink-secondary">
              Pick garments below to build your custom outfit combination.
            </p> */}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={outfitName}
              onChange={(e) => setOutfitName(e.target.value)}
              placeholder="Outfit name (e.g. My Favorite Look)"
              className="bg-white text-ink-primary text-xs sm:text-sm rounded-xl border border-border-light px-3 py-1.5 focus:border-ink-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || selectedItemIds.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink-primary hover:bg-accent-hover text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <BookmarkCheck className="w-3.5 h-3.5 text-accent-gold" />
              )}
              <span>Save Outfit</span>
            </button>
          </div>
        </div>

        {/* Selected Items Previews */}
        {selectedItems.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2.5">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-white border border-border-light shadow-2xs"
              >
                <div className="w-8 h-8 rounded-lg bg-surface-subtle overflow-hidden shrink-0">
                  <img
                    src={item.images?.[0]?.imageUrl || "/images/hero/1.jpg"}
                    alt={item.subcategory || item.category}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-ink-primary max-w-[100px] truncate">
                  {item.subcategory || item.category}
                </span>
                <button
                  type="button"
                  onClick={() => toggleItemSelection(item.id)}
                  className="w-4 h-4 rounded-full hover:bg-surface-subtle text-ink-muted hover:text-ink-primary flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-ink-muted italic py-1">
            No items selected yet. Click on any item below to add it.
          </p>
        )}
      </div>

      {/* 2. Wardrobe Garments Grid with Category Filter */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-xs sm:text-sm font-bold text-ink-primary">
            Select from Your Wardrobe:
          </span>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              "ALL",
              "TOPS",
              "BOTTOMS",
              "OUTERWEAR",
              "SHOES",
              "ACCESSORIES",
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeCategoryFilter === cat
                    ? "bg-ink-primary text-white"
                    : "bg-surface-subtle text-ink-secondary hover:text-ink-primary"
                }`}
              >
                {cat === "ALL" ? "All" : cat.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {displayedItems.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {displayedItems.map((item) => {
              const isSelected = selectedItemIds.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItemSelection(item.id)}
                  className={`flex flex-col items-center p-2 rounded-2xl border transition-all text-center group focus:outline-none relative ${
                    isSelected
                      ? "bg-[#F4ECE1] border-ink-primary shadow-xs ring-2 ring-ink-primary"
                      : "bg-white border-border-light hover:border-border-subtle"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-surface-subtle/60 overflow-hidden mb-1 flex items-center justify-center">
                    {item.images?.[0]?.imageUrl ? (
                      <img
                        src={item.images[0].imageUrl}
                        alt={item.subcategory || item.category}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Shirt className="w-5 h-5 text-ink-muted" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-ink-primary truncate w-full">
                    {item.subcategory || item.category}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-ink-muted text-xs">
            No items found in this category.
          </div>
        )}
      </div>
    </div>
  );
};
