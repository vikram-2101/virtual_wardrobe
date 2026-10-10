import React from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Shirt,
  Calendar,
  Palette,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { OnboardingPreferences } from "../types";

export interface Step3StyleProps {
  preferences: OnboardingPreferences;
  onUpdatePreferences: (updates: Partial<OnboardingPreferences>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
}

const STYLE_VIBES = [
  { id: "clean_minimal", label: "Clean & Minimal" },
  { id: "casual_relaxed", label: "Casual & Relaxed" },
  { id: "streetwear", label: "Streetwear" },
  { id: "classic_timeless", label: "Classic & Timeless" },
  { id: "formal", label: "Formal" },
  { id: "sporty", label: "Sporty" },
  { id: "bold_expressive", label: "Bold & Expressive" },
  { id: "preppy", label: "Preppy" },
];

const OCCASIONS = [
  { id: "everyday", label: "Everyday" },
  { id: "college", label: "College" },
  { id: "work", label: "Work" },
  { id: "formal", label: "Formal" },
  { id: "party", label: "Party" },
  { id: "travel", label: "Travel" },
  { id: "gym", label: "Gym" },
  { id: "date", label: "Date" },
];

const COLOR_SWATCHES = [
  { id: "black", label: "Black", colorClass: "bg-[#14171A]", textLight: true },
  {
    id: "white",
    label: "White",
    colorClass: "bg-[#FFFFFF] border border-border-light",
    textLight: false,
  },
  { id: "grey", label: "Grey", colorClass: "bg-[#71717A]", textLight: true },
  { id: "blue", label: "Blue", colorClass: "bg-[#3B82F6]", textLight: true },
  { id: "brown", label: "Brown", colorClass: "bg-[#78350F]", textLight: true },
  { id: "green", label: "Green", colorClass: "bg-[#16A34A]", textLight: true },
  { id: "red", label: "Red", colorClass: "bg-[#DC2626]", textLight: true },
  { id: "beige", label: "Beige", colorClass: "bg-[#D4B996]", textLight: false },
  {
    id: "offwhite",
    label: "Cream",
    colorClass: "bg-[#FAF5EF] border border-border-light",
    textLight: false,
  },
  {
    id: "other",
    label: "Other",
    colorClass: "bg-gradient-to-tr from-teal-400 via-indigo-500 to-pink-500",
    textLight: true,
  },
];

export const Step3Style: React.FC<Step3StyleProps> = ({
  preferences,
  onUpdatePreferences,
  onNext,
  onBack,
}) => {
  const toggleStyle = (styleId: string) => {
    const current = preferences.styles || [];
    const updated = current.includes(styleId)
      ? current.filter((s) => s !== styleId)
      : [...current, styleId];
    onUpdatePreferences({ styles: updated });
  };

  const toggleOccasion = (occasionId: string) => {
    const current = preferences.occasions || [];
    const updated = current.includes(occasionId)
      ? current.filter((o) => o !== occasionId)
      : [...current, occasionId];
    onUpdatePreferences({ occasions: updated });
  };

  const toggleColor = (colorId: string) => {
    const current = preferences.colors || [];
    const updated = current.includes(colorId)
      ? current.filter((c) => c !== colorId)
      : [...current, colorId];
    onUpdatePreferences({ colors: updated });
  };

  return (
    <div className="bg-surface rounded-3xl sm:rounded-4xl border border-border-light shadow-card p-6 sm:p-8 lg:p-10 transition-all">
      {/* Step Header */}
      <div className="border-b border-border-light/60 pb-5 mb-6">
        <span className="text-[11px] sm:text-xs font-bold tracking-widest text-ink-secondary uppercase">
          STEP 3 OF 4
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight font-sans mt-1">
          Your Style Preferences
        </h2>
        <p className="text-xs sm:text-sm text-ink-secondary mt-1">
          Select the styles, occasions, and colors you like. You can pick
          multiple options.
        </p>
      </div>

      <div className="space-y-6 text-left">
        {/* 1. Style Vibe (text-only cards for now, ready for future images) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shirt className="w-4 h-4 text-ink-primary" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-ink-primary">
                Style Vibe
              </span>
              <span className="text-[11px] text-ink-muted ml-2">
                Choose 2–3 styles that best describe you (optional)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {STYLE_VIBES.map((vibe) => {
              const isSelected = (preferences.styles || []).includes(vibe.id);
              return (
                <button
                  key={vibe.id}
                  type="button"
                  onClick={() => toggleStyle(vibe.id)}
                  className={`group relative p-3 sm:p-4 rounded-2xl border transition-all text-center flex flex-col items-center justify-center min-h-[70px] select-none ${
                    isSelected
                      ? "border-ink-primary bg-[#F5EFEA] ring-1 ring-ink-primary shadow-sm"
                      : "border-border-light bg-white hover:border-border-subtle hover:bg-surface-subtle/50"
                  }`}
                >
                  <span
                    className={`text-xs sm:text-sm font-semibold tracking-tight transition-colors ${
                      isSelected ? "text-ink-primary" : "text-ink-primary/90"
                    }`}
                  >
                    {vibe.label}
                  </span>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-ink-primary text-white flex items-center justify-center shadow-sm">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Preferred Occasions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-ink-primary" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-ink-primary">
                Preferred Occasions
              </span>
              <span className="text-[11px] text-ink-muted ml-2">
                Helps us suggest outfits for the right moments (optional)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {OCCASIONS.map((occasion) => {
              const isSelected = (preferences.occasions || []).includes(
                occasion.id,
              );
              return (
                <button
                  key={occasion.id}
                  type="button"
                  onClick={() => toggleOccasion(occasion.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all select-none ${
                    isSelected
                      ? "border-ink-primary bg-[#F5EFEA] text-ink-primary ring-1 ring-ink-primary shadow-sm"
                      : "border-border-light bg-white text-ink-secondary hover:text-ink-primary hover:border-border-subtle"
                  }`}
                >
                  {occasion.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Favorite Colors */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-ink-primary" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-ink-primary">
                Favorite Colors
              </span>
              <span className="text-[11px] text-ink-muted ml-2">
                Select the colors you usually wear (optional)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {COLOR_SWATCHES.map((swatch) => {
              const isSelected = (preferences.colors || []).includes(swatch.id);
              return (
                <button
                  key={swatch.id}
                  type="button"
                  onClick={() => toggleColor(swatch.id)}
                  className="flex flex-col items-center gap-1 group focus:outline-none"
                >
                  {/* Swatch circle */}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${swatch.colorClass} flex items-center justify-center transition-all ${
                      isSelected
                        ? "ring-2 ring-offset-2 ring-ink-primary scale-110 shadow-sm"
                        : "group-hover:scale-105"
                    }`}
                  >
                    {isSelected && (
                      <Check
                        className={`w-4 h-4 stroke-[2.5] ${
                          swatch.textLight ? "text-white" : "text-ink-primary"
                        }`}
                      />
                    )}
                  </div>

                  {/* Swatch Label */}
                  <span
                    className={`text-[11px] transition-colors ${
                      isSelected
                        ? "font-bold text-ink-primary"
                        : "font-medium text-ink-secondary"
                    }`}
                  >
                    {swatch.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border-light/60">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onBack}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
            className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold"
          >
            Back
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onNext}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold shadow-sm"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
