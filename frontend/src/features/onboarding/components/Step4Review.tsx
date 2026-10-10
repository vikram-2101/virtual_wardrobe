import React from "react";
import {
  ArrowRight,
  ArrowLeft,
  User,
  Image as ImageIcon,
  Palette,
  Pencil,
  Sparkles,
  Plus,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { OnboardingPreferences } from "../types";

export interface Step4ReviewProps {
  preferences: OnboardingPreferences;
  onBack: () => void;
  onEdit: (stepId: number) => void;
  onComplete: () => void;
}

const STYLE_LABELS: Record<string, string> = {
  clean_minimal: "Clean & Minimal",
  casual_relaxed: "Casual & Relaxed",
  streetwear: "Streetwear",
  classic_timeless: "Classic & Timeless",
  formal: "Formal",
  sporty: "Sporty",
  bold_expressive: "Bold & Expressive",
  preppy: "Preppy",
};

const OCCASION_LABELS: Record<string, string> = {
  everyday: "Everyday",
  college: "College",
  work: "Work",
  formal: "Formal",
  party: "Party",
  travel: "Travel",
  gym: "Gym",
  date: "Date",
};

const COLOR_MAP: Record<string, { bg: string; border?: boolean }> = {
  black: { bg: "bg-[#14171A]" },
  white: { bg: "bg-[#FFFFFF]", border: true },
  grey: { bg: "bg-[#71717A]" },
  blue: { bg: "bg-[#3B82F6]" },
  brown: { bg: "bg-[#78350F]" },
  green: { bg: "bg-[#16A34A]" },
  red: { bg: "bg-[#DC2626]" },
  beige: { bg: "bg-[#D4B996]" },
  offwhite: { bg: "bg-[#FAF5EF]", border: true },
  other: {
    bg: "bg-gradient-to-tr from-teal-400 via-indigo-500 to-pink-500",
  },
};

export const Step4Review: React.FC<Step4ReviewProps> = ({
  preferences,
  onBack,
  onEdit,
  onComplete,
}) => {
  const photos = preferences.photos || [];
  const mainPhoto = photos.find((p) => p.isMain) || photos[0];
  const otherPhotos = photos.filter((p) => p.id !== mainPhoto?.id);

  return (
    <div className="bg-surface rounded-3xl sm:rounded-4xl border border-border-light shadow-card p-6 sm:p-8 lg:p-10 transition-all">
      {/* Step Header */}
      <div className="border-b border-border-light/60 pb-5 mb-6">
        <span className="text-[11px] sm:text-xs font-bold tracking-widest text-ink-secondary uppercase">
          STEP 4 OF 4
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight font-sans mt-1">
          Review Your Profile
        </h2>
        <p className="text-xs sm:text-sm text-ink-secondary mt-1">
          Everything looks great! You can always update these details later in
          your profile settings.
        </p>
      </div>

      <div className="space-y-4 sm:space-y-5 text-left">
        {/* 1. Card: Personal Information */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle/40 border border-border-light/80 hover:border-border-subtle transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-ink-primary stroke-[2]" />
              <h3 className="text-xs sm:text-sm font-bold text-ink-primary">
                Personal Information
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEdit(1)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-ink-secondary hover:text-ink-primary bg-white hover:bg-surface-subtle px-2.5 py-1 rounded-lg border border-border-light transition-colors"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div>
              <span className="text-[11px] text-ink-secondary block">Name</span>
              <span className="text-xs sm:text-sm font-semibold text-ink-primary mt-0.5 block">
                {preferences.name || "Vikram"}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-ink-secondary block">
                Height
              </span>
              <span className="text-xs sm:text-sm font-semibold text-ink-primary mt-0.5 block">
                {preferences.height
                  ? `${preferences.height} ${preferences.heightUnit}`
                  : "167 cm"}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-ink-secondary block">
                Weight
              </span>
              <span className="text-xs sm:text-sm font-semibold text-ink-primary mt-0.5 block">
                {preferences.weight
                  ? `${preferences.weight} ${preferences.weightUnit}`
                  : "45 kg"}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-ink-secondary block">
                Preferred Fit
              </span>
              <span className="text-xs sm:text-sm font-semibold text-ink-primary mt-0.5 block capitalize">
                {preferences.preferredFit || "Regular"}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Card: Your Photo */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle/40 border border-border-light/80 hover:border-border-subtle transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <ImageIcon className="w-4 h-4 text-ink-primary stroke-[2]" />
              <h3 className="text-xs sm:text-sm font-bold text-ink-primary">
                Your Photo
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEdit(2)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-ink-secondary hover:text-ink-primary bg-white hover:bg-surface-subtle px-2.5 py-1 rounded-lg border border-border-light transition-colors"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Main Photo Thumbnail + Info */}
            <div className="flex items-center gap-3">
              {mainPhoto ? (
                <div className="w-14 sm:w-16 aspect-[3/4] rounded-xl overflow-hidden border border-border-light shadow-sm">
                  <img
                    src={mainPhoto.url}
                    alt="Main try-on"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 sm:w-16 aspect-[3/4] rounded-xl bg-white border border-border-light flex items-center justify-center text-ink-muted">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}

              <div>
                <span className="text-xs font-bold text-ink-primary block">
                  {photos.length > 0
                    ? `${photos.length} photo uploaded`
                    : "No photo uploaded"}
                </span>
                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] font-semibold">
                  Main photo
                </span>
              </div>
            </div>

            {/* Additional Photos & Add More button */}
            <div className="flex items-center gap-2 sm:ml-auto">
              {otherPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="w-12 sm:w-14 aspect-[3/4] rounded-xl overflow-hidden border border-border-light shadow-xs"
                >
                  <img
                    src={photo.url}
                    alt="Additional try-on"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => onEdit(2)}
                className="w-12 sm:w-14 aspect-[3/4] rounded-xl border border-dashed border-border-subtle hover:border-ink-primary bg-white hover:bg-surface-subtle/60 flex flex-col items-center justify-center p-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-ink-secondary mb-0.5" />
                <span className="text-[9px] font-semibold text-ink-secondary text-center leading-tight">
                  Add more
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Card: Style Preferences */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle/40 border border-border-light/80 hover:border-border-subtle transition-all space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Palette className="w-4 h-4 text-ink-primary stroke-[2]" />
              <h3 className="text-xs sm:text-sm font-bold text-ink-primary">
                Style Preferences
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEdit(3)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-ink-secondary hover:text-ink-primary bg-white hover:bg-surface-subtle px-2.5 py-1 rounded-lg border border-border-light transition-colors"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          {/* Style Vibe Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
            <span className="sm:col-span-3 text-[11px] sm:text-xs text-ink-secondary font-medium">
              Style Vibe
            </span>
            <div className="sm:col-span-9 flex flex-wrap gap-1.5">
              {preferences.styles && preferences.styles.length > 0 ? (
                preferences.styles.map((style) => (
                  <span
                    key={style}
                    className="px-2.5 py-1 rounded-xl bg-white border border-border-light text-[11px] font-semibold text-ink-primary"
                  >
                    {STYLE_LABELS[style] || style.replace(/_/g, " ")}
                  </span>
                ))
              ) : (
                <span className="text-xs text-ink-muted">Any styles</span>
              )}
            </div>
          </div>

          {/* Occasions Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
            <span className="sm:col-span-3 text-[11px] sm:text-xs text-ink-secondary font-medium">
              Occasions
            </span>
            <div className="sm:col-span-9 flex flex-wrap gap-1.5">
              {preferences.occasions && preferences.occasions.length > 0 ? (
                preferences.occasions.map((occasion) => (
                  <span
                    key={occasion}
                    className="px-2.5 py-1 rounded-xl bg-white border border-border-light text-[11px] font-semibold text-ink-primary capitalize"
                  >
                    {OCCASION_LABELS[occasion] || occasion}
                  </span>
                ))
              ) : (
                <span className="text-xs text-ink-muted">All occasions</span>
              )}
            </div>
          </div>

          {/* Favorite Colors Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
            <span className="sm:col-span-3 text-[11px] sm:text-xs text-ink-secondary font-medium">
              Favorite Colors
            </span>
            <div className="sm:col-span-9 flex items-center gap-2">
              {preferences.colors && preferences.colors.length > 0 ? (
                preferences.colors.map((color) => {
                  const conf = COLOR_MAP[color] || { bg: "bg-ink-primary" };
                  return (
                    <div
                      key={color}
                      className={`w-5 h-5 rounded-full ${conf.bg} ${
                        conf.border ? "border border-border-light" : ""
                      } shadow-xs`}
                      title={color}
                    />
                  );
                })
              ) : (
                <span className="text-xs text-ink-muted">All palettes</span>
              )}
            </div>
          </div>
        </div>

        {/* 4. Ready Callout Banner */}
        <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-[#FAF4E8] border border-amber-200/70 text-left">
          <div className="w-8 h-8 rounded-full bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-ink-primary">
              You’re ready to start!
            </h4>
            <p className="text-[11px] sm:text-xs text-ink-secondary mt-0.5">
              Add some clothes to your wardrobe and generate your first outfit.
            </p>
          </div>
        </div>

        {/* 5. Footer Actions */}
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
            onClick={onComplete}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="px-7 py-3 rounded-2xl text-xs sm:text-sm font-semibold shadow-md bg-ink-primary hover:bg-accent-hover"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
