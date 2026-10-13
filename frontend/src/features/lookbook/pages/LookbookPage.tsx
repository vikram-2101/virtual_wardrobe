import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, Bookmark } from "lucide-react";
import { LookbookTab } from "../types";
import { OutfitResponse, OccasionType } from "../../stylist/types";
import {
  listOutfits,
  deleteOutfit,
  toggleFavoriteOutfit,
} from "../../stylist/services/outfitService";
import { LookbookHeader } from "../components/LookbookHeader";
import { LookbookCollectionsRow } from "../components/LookbookCollectionsRow";
import { LookbookFilterBar } from "../components/LookbookFilterBar";
import { LookbookOutfitCard } from "../components/LookbookOutfitCard";

export interface LookbookPageProps {
  onNavigateToStylist: () => void;
  onNavigateToTryOn: (outfit?: OutfitResponse) => void;
}

export const LookbookPage: React.FC<LookbookPageProps> = ({
  onNavigateToStylist,
  onNavigateToTryOn,
}) => {
  const [activeTab, setActiveTab] = useState<LookbookTab>("all");
  const [outfits, setOutfits] = useState<OutfitResponse[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState<
    OccasionType | "ALL"
  >("ALL");
  const [selectedSeason, setSelectedSeason] = useState("ALL");
  const [sortBy, setSortBy] = useState<"RECENT" | "FAVORITES" | "NAME">(
    "RECENT",
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Load outfits from API
  const fetchOutfits = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listOutfits();
      setOutfits(data);
    } catch (err) {
      console.error("Failed to load lookbook outfits:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutfits();
  }, [fetchOutfits]);

  // Handle Favorites toggle
  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleFavoriteOutfit(id);
      setOutfits((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, isFavorite: !o.isFavorite } : o,
        ),
      );
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    try {
      await deleteOutfit(id);
      setOutfits((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Failed to delete outfit:", err);
    }
  };

  // Filtered and Sorted Outfits
  const filteredOutfits = useMemo(() => {
    const list = outfits.filter((outfit) => {
      // Tab filter
      if (activeTab === "favorites" && !outfit.isFavorite) return false;

      // Occasion filter
      if (selectedOccasion !== "ALL" && outfit.occasion !== selectedOccasion)
        return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = outfit.name?.toLowerCase().includes(query);
        const matchesItem = outfit.items?.some(
          (item) =>
            item.subcategory?.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            item.color?.toLowerCase().includes(query),
        );
        if (!matchesName && !matchesItem) return false;
      }

      return true;
    });

    if (sortBy === "FAVORITES") {
      return [...list].sort(
        (a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0),
      );
    }
    if (sortBy === "NAME") {
      return [...list].sort((a, b) =>
        (a.name || "").localeCompare(b.name || ""),
      );
    }
    return list;
  }, [outfits, activeTab, selectedOccasion, searchQuery, sortBy]);

  const favoritesCount = useMemo(
    () => outfits.filter((o) => o.isFavorite).length,
    [outfits],
  );

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-5 text-left animate-fadeIn">
      {/* 1. Header with Sub-tabs and CTAs */}
      <LookbookHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalOutfitsCount={outfits.length}
        favoritesCount={favoritesCount}
        collectionsCount={4}
        onCreateNewLook={onNavigateToStylist}
      />

      {/* 2. Top Capsule Collections Tray */}
      <LookbookCollectionsRow
        collections={[]}
        selectedCollectionId={selectedCollectionId}
        onSelectCollection={setSelectedCollectionId}
        onCreateCollection={() => {
          console.log("Create new collection");
        }}
      />

      {/* 3. Filter & Search Bar */}
      <LookbookFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        occasion={selectedOccasion}
        onOccasionChange={setSelectedOccasion}
        season={selectedSeason}
        onSeasonChange={setSelectedSeason}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 4. Main Outfits Grid */}
      {loading ? (
        <div className="w-full py-16 flex flex-col items-center justify-center text-ink-muted">
          <Loader2 className="w-8 h-8 animate-spin text-ink-primary mb-3" />
          <p className="text-xs sm:text-sm font-medium">
            Loading your curated outfits...
          </p>
        </div>
      ) : filteredOutfits.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4.5"
              : "grid grid-cols-1 sm:grid-cols-2 gap-3"
          }
        >
          {filteredOutfits.map((outfit) => (
            <LookbookOutfitCard
              key={outfit.id}
              outfit={outfit}
              onTryOn={(o) => onNavigateToTryOn(o)}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="w-full bg-white rounded-3xl border border-border-light p-10 sm:p-14 text-center flex flex-col items-center justify-center shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-surface-subtle flex items-center justify-center text-ink-secondary mb-3">
            <Bookmark className="w-6 h-6 text-accent-gold" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-ink-primary font-sans mb-1">
            {activeTab === "favorites"
              ? "No Favorite Outfits Yet"
              : "No Outfits in Lookbook"}
          </h3>
          <p className="text-xs text-ink-secondary max-w-sm mb-4">
            {activeTab === "favorites"
              ? "Click the heart icon on any outfit to save it to your favorites list."
              : "Generate AI outfits or build custom looks to save them in your personal lookbook."}
          </p>
          {/* <button
            type="button"
            onClick={onNavigateToStylist}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink-primary hover:bg-accent-hover text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
            <span>Generate Outfits with AI</span>
          </button> */}
        </div>
      )}
    </div>
  );
};
