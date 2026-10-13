import React from "react";
import { Ruler } from "lucide-react";

export interface BodyMeasurementsCardProps {
  name: string;
  onNameChange: (val: string) => void;
  height: number | string;
  onHeightChange: (val: number | string) => void;
  weight: number | string;
  onWeightChange: (val: number | string) => void;
  gender: string;
  onGenderChange: (val: string) => void;
  fitPreference: string;
  onFitPreferenceChange: (val: string) => void;
}

export const BodyMeasurementsCard: React.FC<BodyMeasurementsCardProps> = ({
  name,
  onNameChange,
  height,
  onHeightChange,
  weight,
  onWeightChange,
  gender,
  onGenderChange,
  fitPreference,
  onFitPreferenceChange,
}) => {
  const GENDERS = ["Unspecified", "Female", "Male", "Non-Binary"];
  const FIT_TYPES = [
    "Slim Fit",
    "Regular Fit",
    "Relaxed Fit",
    "Oversized",
    "Tailored",
  ];

  return (
    <div className="w-full bg-white rounded-3xl border border-border-light shadow-card p-4 sm:p-5 text-left animate-fadeIn">
      <h2 className="text-xs sm:text-sm font-bold text-ink-primary font-sans mb-3.5 flex items-center gap-2">
        <Ruler className="w-4 h-4 text-ink-secondary" />
        <span>1. Body Measurements & Fit</span>
      </h2>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="text-xs font-bold text-ink-primary block mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Your name"
            className="w-full bg-surface-subtle/50 text-ink-primary text-xs rounded-xl border border-border-light focus:border-ink-primary px-3 py-2.5 shadow-2xs focus:outline-none transition-all"
          />
        </div>

        {/* Height & Weight 2-Col */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-ink-primary block mb-1">
              Height (cm)
            </label>
            <div className="relative">
              <input
                type="number"
                value={height}
                onChange={(e) => onHeightChange(e.target.value)}
                placeholder="175"
                min="100"
                max="250"
                className="w-full bg-surface-subtle/50 text-ink-primary text-xs rounded-xl border border-border-light focus:border-ink-primary px-3 py-2.5 shadow-2xs focus:outline-none transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-muted">
                cm
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-ink-primary block mb-1">
              Weight (kg)
            </label>
            <div className="relative">
              <input
                type="number"
                value={weight}
                onChange={(e) => onWeightChange(e.target.value)}
                placeholder="68"
                min="30"
                max="200"
                className="w-full bg-surface-subtle/50 text-ink-primary text-xs rounded-xl border border-border-light focus:border-ink-primary px-3 py-2.5 shadow-2xs focus:outline-none transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-muted">
                kg
              </span>
            </div>
          </div>
        </div>

        {/* Gender / Clothing Cut */}
        <div>
          <label className="text-xs font-bold text-ink-primary block mb-1.5">
            Preferred Clothing Cut / Gender
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {GENDERS.map((g) => {
              const isSelected = gender === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => onGenderChange(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-ink-primary text-white shadow-xs"
                      : "bg-surface-subtle text-ink-secondary hover:bg-border-light"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fit Preference */}
        <div>
          <label className="text-xs font-bold text-ink-primary block mb-1.5">
            Fit Preference
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {FIT_TYPES.map((fit) => {
              const isSelected = fitPreference === fit;
              return (
                <button
                  key={fit}
                  type="button"
                  onClick={() => onFitPreferenceChange(fit)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#F4ECE1] text-ink-primary border border-ink-primary shadow-xs ring-1 ring-ink-primary/20"
                      : "bg-white border border-border-light text-ink-secondary hover:border-border-subtle"
                  }`}
                >
                  {fit}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
