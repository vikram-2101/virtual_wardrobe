import React from "react";
import { Plus, Heart, Folder } from "lucide-react";
import { LookbookTab } from "../types";

export interface LookbookHeaderProps {
  activeTab: LookbookTab;
  onTabChange: (tab: LookbookTab) => void;
  totalOutfitsCount: number;
  favoritesCount: number;
  collectionsCount: number;
  onCreateNewLook: () => void;
}

export const LookbookHeader: React.FC<LookbookHeaderProps> = ({
  activeTab,
  onTabChange,
  totalOutfitsCount,
  favoritesCount,
  collectionsCount,
  onCreateNewLook,
}) => {
  return (
    <div className="w-full flex flex-col gap-3.5 text-left animate-fadeIn py-1">
      {/* 1. Top Title & Single Primary Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-ink-secondary uppercase block">
            My Curated Looks
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-ink-primary font-sans leading-tight">
              Saved Outfits & Lookbook
            </h1>
          </div>
          <p className="text-xs text-ink-secondary mt-0.5">
            Your personal style library. Save, organize, and revisit your
            favorite looks.
          </p>
        </div>

        {/* Single Primary Action Button */}
        <div className="self-start sm:self-auto">
          <button
            type="button"
            onClick={onCreateNewLook}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-ink-primary hover:bg-accent-hover text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Look</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
        <button
          type="button"
          onClick={() => onTabChange("all")}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-[#F4ECE1] text-ink-primary ring-1 ring-ink-primary/20 shadow-2xs"
              : "bg-white border border-border-light text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle/50"
          }`}
        >
          <span>All Outfits</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-subtle text-ink-muted">
            {totalOutfitsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("favorites")}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "favorites"
              ? "bg-[#F4ECE1] text-ink-primary ring-1 ring-ink-primary/20 shadow-2xs"
              : "bg-white border border-border-light text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle/50"
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>Favorites</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-subtle text-ink-muted">
            {favoritesCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("collections")}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "collections"
              ? "bg-[#F4ECE1] text-ink-primary ring-1 ring-ink-primary/20 shadow-2xs"
              : "bg-white border border-border-light text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle/50"
          }`}
        >
          <Folder className="w-3.5 h-3.5 text-ink-secondary" />
          <span>Collections</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-subtle text-ink-muted">
            {collectionsCount}
          </span>
        </button>
      </div>
    </div>
  );
};
