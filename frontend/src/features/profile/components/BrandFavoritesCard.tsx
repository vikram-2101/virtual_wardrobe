import React, { useState } from "react";
import { Tag, Plus, X, Check } from "lucide-react";

export interface BrandFavoritesCardProps {
  favoriteBrands: string[];
  onAddBrand: (brand: string) => void;
  onRemoveBrand: (brand: string) => void;
}

const POPULAR_BRANDS = [
  "Zara",
  "Uniqlo",
  "COS",
  "Massimo Dutti",
  "Nike",
  "Arket",
  "Mango",
  "Ralph Lauren",
  "Levi's",
  "H&M",
];

export const BrandFavoritesCard: React.FC<BrandFavoritesCardProps> = ({
  favoriteBrands,
  onAddBrand,
  onRemoveBrand,
}) => {
  const [customBrand, setCustomBrand] = useState("");

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customBrand.trim() && !favoriteBrands.includes(customBrand.trim())) {
      onAddBrand(customBrand.trim());
      setCustomBrand("");
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-border-light shadow-card p-4 sm:p-5 text-left animate-fadeIn">
      <h2 className="text-xs sm:text-sm font-bold text-ink-primary font-sans mb-3.5 flex items-center gap-2">
        <Tag className="w-4 h-4 text-ink-secondary" />
        <span>3. Favorite Brands & Labels</span>
      </h2>

      <div className="space-y-3.5">
        {/* Active Brands Chips */}
        <div>
          <label className="text-xs font-bold text-ink-primary block mb-1.5">
            Your Selected Brands ({favoriteBrands.length})
          </label>
          <div className="flex items-center gap-1.5 flex-wrap min-h-[36px]">
            {favoriteBrands.length > 0 ? (
              favoriteBrands.map((brand) => (
                <span
                  key={brand}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-subtle border border-border-light text-ink-primary text-xs font-semibold shadow-2xs"
                >
                  <span>{brand}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveBrand(brand)}
                    className="w-3.5 h-3.5 rounded-full hover:bg-ink-muted/20 flex items-center justify-center text-ink-muted hover:text-ink-primary cursor-pointer transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs text-ink-muted italic">
                No favorite brands added yet. Click suggestions below or type
                your own.
              </span>
            )}
          </div>
        </div>

        {/* Add Custom Brand Input */}
        <form onSubmit={handleAddCustom} className="flex items-center gap-2">
          <input
            type="text"
            value={customBrand}
            onChange={(e) => setCustomBrand(e.target.value)}
            placeholder="Add brand (e.g. Acne Studios)"
            className="flex-1 bg-surface-subtle/50 text-ink-primary text-xs rounded-xl border border-border-light focus:border-ink-primary px-3 py-2 shadow-2xs focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!customBrand.trim()}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-ink-primary hover:bg-accent-hover text-white text-xs font-bold shadow-2xs transition-all disabled:opacity-40 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Quick Suggestions */}
        <div>
          <label className="text-[11px] font-semibold text-ink-muted block mb-1">
            Quick suggestions:
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {POPULAR_BRANDS.map((brand) => {
              const isAdded = favoriteBrands.includes(brand);
              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() =>
                    isAdded ? onRemoveBrand(brand) : onAddBrand(brand)
                  }
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    isAdded
                      ? "bg-[#F4ECE1] text-ink-primary border border-ink-primary/40 font-bold"
                      : "bg-surface-subtle/40 border border-border-light text-ink-secondary hover:bg-surface-subtle"
                  }`}
                >
                  {isAdded && <Check className="w-2.5 h-2.5 inline mr-1" />}
                  <span>{brand}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
