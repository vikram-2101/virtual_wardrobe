import React, { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { UserProfile, ParsedStylePreferences } from "../types";
import {
  getCurrentUserProfile,
  updateUserProfile,
} from "../services/profileService";
import { ProfileHeader } from "../components/ProfileHeader";
import { BodyMeasurementsCard } from "../components/BodyMeasurementsCard";
import { StylePreferencesCard } from "../components/StylePreferencesCard";
import { BrandFavoritesCard } from "../components/BrandFavoritesCard";

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Form State
  const [name, setName] = useState("Vikram Kumar");
  const [height, setHeight] = useState<number | string>(175);
  const [weight, setWeight] = useState<number | string>(68);
  const [gender, setGender] = useState("Unspecified");
  const [fitPreference, setFitPreference] = useState("Regular Fit");

  // Style Preferences State
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>([
    "Minimalist",
    "Scandinavian",
  ]);
  const [colorSeason, setColorSeason] = useState("Warm Autumn");
  const [selectedColors, setSelectedColors] = useState<string[]>([
    "Black",
    "Navy",
    "Beige",
    "Olive",
  ]);
  const [favoriteBrands, setFavoriteBrands] = useState<string[]>([
    "Zara",
    "Uniqlo",
    "COS",
  ]);

  // Load User Profile on mount
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCurrentUserProfile();
      setProfile(data);
      if (data) {
        if (data.name) setName(data.name);
        if (data.height) setHeight(data.height);
        if (data.weight) setWeight(data.weight);
        if (data.gender) setGender(data.gender);

        // Parse style preferences JSON if present
        if (data.stylePreferences) {
          try {
            const parsed: ParsedStylePreferences = JSON.parse(
              data.stylePreferences,
            );
            if (parsed.aesthetics) setSelectedAesthetics(parsed.aesthetics);
            if (parsed.colorSeason) setColorSeason(parsed.colorSeason);
            if (parsed.favoriteColors) setSelectedColors(parsed.favoriteColors);
            if (parsed.favoriteBrands)
              setSelectedBrandsSafe(parsed.favoriteBrands);
            if (parsed.fitPreference) setFitPreference(parsed.fitPreference);
          } catch {
            // Fallback plain string
          }
        }
      }
    } catch (err) {
      console.warn("Could not load user profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const setSelectedBrandsSafe = (brands: string[]) => {
    setFavoriteBrands(brands);
  };

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Track changes
  const markChanged = () => setHasChanges(true);

  // Toggle Handlers
  const handleToggleAesthetic = (aesthetic: string) => {
    markChanged();
    setSelectedAesthetics((prev) =>
      prev.includes(aesthetic)
        ? prev.filter((a) => a !== aesthetic)
        : [...prev, aesthetic],
    );
  };

  const handleToggleColor = (color: string) => {
    markChanged();
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const handleAddBrand = (brand: string) => {
    markChanged();
    if (!favoriteBrands.includes(brand)) {
      setFavoriteBrands([...favoriteBrands, brand]);
    }
  };

  const handleRemoveBrand = (brand: string) => {
    markChanged();
    setFavoriteBrands(favoriteBrands.filter((b) => b !== brand));
  };

  // Save handler
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setFeedback(null);

      const stylePrefPayload: ParsedStylePreferences = {
        aesthetics: selectedAesthetics,
        colorSeason,
        favoriteColors: selectedColors,
        favoriteBrands,
        fitPreference,
      };

      const updated = await updateUserProfile({
        name,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        gender,
        stylePreferences: JSON.stringify(stylePrefPayload),
      });

      setProfile(updated);
      setHasChanges(false);
      setFeedback("✨ Profile and style preferences saved successfully!");
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setFeedback(
        err.response?.data?.message || "Failed to save profile changes.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-ink-muted">
        <Loader2 className="w-8 h-8 animate-spin text-ink-primary mb-3" />
        <p className="text-xs sm:text-sm font-medium">
          Loading your style profile...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-5 text-left animate-fadeIn">
      {/* 1. Header with Avatar & Save CTA */}
      <ProfileHeader
        name={name}
        email={profile?.email || "vikram@example.com"}
        isSaving={isSaving}
        onSave={handleSave}
        hasChanges={hasChanges}
      />

      {/* Feedback Banner */}
      {feedback && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold animate-fadeIn">
          {feedback}
        </div>
      )}

      {/* 2. Main 2-Column Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Left Column: Body Measurements & Favorite Brands */}
        <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-5">
          <BodyMeasurementsCard
            name={name}
            onNameChange={(v) => {
              setName(v);
              markChanged();
            }}
            height={height}
            onHeightChange={(v) => {
              setHeight(v);
              markChanged();
            }}
            weight={weight}
            onWeightChange={(v) => {
              setWeight(v);
              markChanged();
            }}
            gender={gender}
            onGenderChange={(v) => {
              setGender(v);
              markChanged();
            }}
            fitPreference={fitPreference}
            onFitPreferenceChange={(v) => {
              setFitPreference(v);
              markChanged();
            }}
          />

          <BrandFavoritesCard
            favoriteBrands={favoriteBrands}
            onAddBrand={handleAddBrand}
            onRemoveBrand={handleRemoveBrand}
          />
        </div>

        {/* Right Column: Style Aesthetics & Color Palette */}
        <div className="lg:col-span-7">
          <StylePreferencesCard
            selectedAesthetics={selectedAesthetics}
            onToggleAesthetic={handleToggleAesthetic}
            colorSeason={colorSeason}
            onColorSeasonChange={(v) => {
              setColorSeason(v);
              markChanged();
            }}
            selectedColors={selectedColors}
            onToggleColor={handleToggleColor}
          />
        </div>
      </div>
    </div>
  );
};
