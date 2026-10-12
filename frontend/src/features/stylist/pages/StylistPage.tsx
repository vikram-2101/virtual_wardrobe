import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, RotateCcw, Loader2 } from "lucide-react";
import { StylistMode, OccasionType, OutfitResponse } from "../types";
import { ClothingCategory, WardrobeItem } from "../../wardrobe/types";
import { listWardrobeItems } from "../../wardrobe/services/wardrobeService";
import {
  generateAutomaticOutfit,
  generateControlledOutfit,
  createManualOutfit,
  listOutfits,
  saveOutfit,
  regenerateOutfit,
  deleteOutfit,
  toggleFavoriteOutfit,
} from "../services/outfitService";
import { StylistModeTabs } from "../components/StylistModeTabs";
import { OccasionSelector } from "../components/OccasionSelector";
import { ControlledSelector } from "../components/ControlledSelector";
import { ManualOutfitBuilder } from "../components/ManualOutfitBuilder";
import { OutfitCard } from "../components/OutfitCard";

export interface StylistPageProps {
  onTryOnOutfit?: (outfit: OutfitResponse) => void;
}

export const StylistPage: React.FC<StylistPageProps> = ({ onTryOnOutfit }) => {
  const [activeMode, setActiveMode] = useState<StylistMode>("occasion");
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [outfits, setOutfits] = useState<OutfitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Occasion Mode state
  const [selectedOccasion, setSelectedOccasion] =
    useState<OccasionType>("CASUAL");
  const [includeShoes, setIncludeShoes] = useState(true);
  const [includeOuterwear, setIncludeOuterwear] = useState(false);

  // Load wardrobe & existing generated outfits on mount
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsData, outfitsData] = await Promise.all([
        listWardrobeItems(),
        listOutfits(),
      ]);
      setWardrobeItems(itemsData);
      setOutfits(outfitsData);
    } catch (err) {
      console.error("Failed to load stylist data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Automatic (Occasion) Generation
  const handleGenerateOccasion = async () => {
    try {
      setIsGenerating(true);
      setFeedbackMessage(null);
      const newOutfit = await generateAutomaticOutfit({
        occasion: selectedOccasion,
        includeShoes,
        includeOuterwear,
      });

      setOutfits((prev) => [
        newOutfit,
        ...prev.filter((o) => o.id !== newOutfit.id),
      ]);
      setFeedbackMessage("✨ New outfit combination generated!");
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err: any) {
      console.error("Failed to generate occasion outfit:", err);
      setFeedbackMessage(
        err.response?.data?.message ||
          "Could not generate outfit. Make sure you have added tops and bottoms to your wardrobe.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Controlled Category Generation
  const handleGenerateControlled = async (
    categories: ClothingCategory[],
    name?: string,
  ) => {
    try {
      setIsGenerating(true);
      setFeedbackMessage(null);
      const newOutfit = await generateControlledOutfit({
        categories,
        name,
      });

      setOutfits((prev) => [
        newOutfit,
        ...prev.filter((o) => o.id !== newOutfit.id),
      ]);
      setFeedbackMessage("✨ Category combination generated!");
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err: any) {
      console.error("Failed to generate controlled outfit:", err);
      setFeedbackMessage(
        err.response?.data?.message ||
          "Could not generate outfit. Ensure your wardrobe contains items for the selected categories.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Manual Outfit Creation
  const handleSaveManualOutfit = async (
    name: string,
    selectedItemIds: string[],
  ) => {
    try {
      setIsGenerating(true);
      const newOutfit = await createManualOutfit({
        name,
        itemIds: selectedItemIds,
      });

      setOutfits((prev) => [newOutfit, ...prev]);
      setFeedbackMessage("💾 Custom outfit saved successfully!");
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err: any) {
      console.error("Failed to save manual outfit:", err);
      setFeedbackMessage("Failed to save custom outfit.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Regenerate Single Outfit
  const handleRegenerateOutfit = async (id: string) => {
    try {
      setIsGenerating(true);
      const regenerated = await regenerateOutfit(id);
      setOutfits((prev) => prev.map((o) => (o.id === id ? regenerated : o)));
      setFeedbackMessage("↻ Outfit regenerated with alternative items!");
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err) {
      console.error("Failed to regenerate outfit:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Delete Outfit
  const handleDeleteOutfit = async (id: string) => {
    try {
      await deleteOutfit(id);
      setOutfits((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Failed to delete outfit:", err);
    }
  };

  // Handle Save Outfit
  const handleSaveOutfit = async (id: string) => {
    try {
      await saveOutfit(id);
      setFeedbackMessage("❤️ Outfit saved to your collection!");
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err) {
      console.error("Failed to save outfit:", err);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3.5 sm:gap-4 text-left animate-fadeIn">
      {/* 1. Header Bar with Mode Switcher on the Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-ink-secondary uppercase block">
            AI Stylist
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-ink-primary font-sans leading-tight">
            Personal Styling Studio
          </h1>
        </div>

        {/* Mode Selector Tabs on Top Right */}
        <StylistModeTabs activeMode={activeMode} onModeChange={setActiveMode} />
      </div>

      {/* 2. Generator Controls Panel */}
      {activeMode === "occasion" && (
        <OccasionSelector
          selectedOccasion={selectedOccasion}
          onSelectOccasion={setSelectedOccasion}
          includeShoes={includeShoes}
          onToggleShoes={setIncludeShoes}
          includeOuterwear={includeOuterwear}
          onToggleOuterwear={setIncludeOuterwear}
        />
      )}

      {activeMode === "controlled" && (
        <ControlledSelector
          onGenerate={handleGenerateControlled}
          isGenerating={isGenerating}
        />
      )}

      {activeMode === "manual" && (
        <ManualOutfitBuilder
          wardrobeItems={wardrobeItems}
          onSaveOutfit={handleSaveManualOutfit}
          isSaving={isGenerating}
        />
      )}

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold animate-fadeIn">
          {feedbackMessage}
        </div>
      )}

      {/* 4. Generated Outfits Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-ink-primary font-sans">
              Generated Outfits ({outfits.length})
            </h2>
            <p className="text-[11px] sm:text-xs text-ink-secondary mt-0.5">
              Here are some outfits curated for you. Save your favorites or try
              them on!
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Generate Button (placed left of Regenerate Outfits) */}
            {activeMode === "occasion" && (
              <button
                type="button"
                onClick={handleGenerateOccasion}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-[15px] bg-ink-primary hover:bg-accent-hover text-white text-[13px] font-semibold shadow-xs hover:shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                    <span>Generate Outfits ✨</span>
                  </>
                )}
              </button>
            )}

            {/* Quick Regenerate All Button */}
            {activeMode === "occasion" && outfits.length > 0 && (
              <button
                type="button"
                onClick={handleGenerateOccasion}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-light hover:border-border-subtle bg-white text-ink-primary text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-ink-secondary" />
                <span>Regenerate Outfits</span>
              </button>
            )}
          </div>
        </div>

        {/* Outfits Grid */}
        {loading ? (
          <div className="w-full py-12 flex flex-col items-center justify-center text-ink-muted">
            <Loader2 className="w-8 h-8 animate-spin text-ink-primary mb-3" />
            <p className="text-xs sm:text-sm font-medium">
              Loading your curated outfits...
            </p>
          </div>
        ) : outfits.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {outfits.map((outfit) => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                onTryOn={(o) => {
                  if (onTryOnOutfit) {
                    onTryOnOutfit(o);
                  }
                }}
                onSave={handleSaveOutfit}
                onRegenerate={handleRegenerateOutfit}
                onDelete={handleDeleteOutfit}
                onToggleFavorite={(id) => toggleFavoriteOutfit(id)}
              />
            ))}
          </div>
        ) : (
          <div className="w-full bg-white rounded-3xl border border-border-light p-10 sm:p-12 text-center flex flex-col items-center justify-center shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-surface-subtle flex items-center justify-center text-ink-secondary mb-3">
              <Sparkles className="w-7 h-7 text-accent-gold" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-ink-primary font-sans mb-1">
              No Outfits Generated Yet
            </h3>
            <p className="text-xs text-ink-secondary max-w-sm mb-4">
              Pick an occasion or select categories above, then click
              &quot;Generate Outfits&quot; to see your AI-styled combinations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
