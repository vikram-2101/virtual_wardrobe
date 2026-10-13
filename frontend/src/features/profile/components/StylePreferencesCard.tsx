import React from "react";
import { Sparkles, Check } from "lucide-react";

export interface StylePreferencesCardProps {
  selectedAesthetics: string[];
  onToggleAesthetic: (aesthetic: string) => void;
  colorSeason: string;
  onColorSeasonChange: (season: string) => void;
  selectedColors: string[];
  onToggleColor: (color: string) => void;
}

const AESTHETICS = [
  "Minimalist",
  "Scandinavian",
  "Casual Chic",
  "Streetwear",
  "Old Money",
  "Smart Formal",
  "Athleisure",
  "Bohemian",
  "Vintage Classic",
];

const COLOR_SEASONS = [
  { id: "Warm Autumn", desc: "Earthy tones, warm olive, rust, gold" },
  { id: "Cool Winter", desc: "High contrast, true black, navy, ice blue" },
  { id: "Light Spring", desc: "Warm peach, pastel coral, bright cream" },
  { id: "Soft Summer", desc: "Muted lavender, slate blue, rose beige" },
];

const PALETTE_COLORS = [
  { name: "Black", hex: "#14171A" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#1E293B" },
  { name: "Beige", hex: "#EADDC7" },
  { name: "Olive", hex: "#606C38" },
  { name: "Charcoal", hex: "#374151" },
  { name: "Rust", hex: "#9C4221" },
  { name: "Sky Blue", hex: "#93C5FD" },
  { name: "Camel", hex: "#C59B63" },
  { name: "Burgundy", hex: "#581845" },
];

export const StylePreferencesCard: React.FC<StylePreferencesCardProps> = ({
  selectedAesthetics,
  onToggleAesthetic,
  colorSeason,
  onColorSeasonChange,
  selectedColors,
  onToggleColor,
}) => {
  return (
    <div className="w-full bg-white rounded-3xl border border-border-light shadow-card p-4 sm:p-5 text-left animate-fadeIn">
      <h2 className="text-xs sm:text-sm font-bold text-ink-primary font-sans mb-3.5 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-accent-gold" />
        <span>2. Style Aesthetics & Color Season</span>
      </h2>

      <div className="space-y-4">
        {/* Style Aesthetics Pills */}
        <div>
          <label className="text-xs font-bold text-ink-primary block mb-1.5">
            Your Core Style Vibes (Select multiple)
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {AESTHETICS.map((style) => {
              const isSelected = selectedAesthetics.includes(style);
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => onToggleAesthetic(style)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-ink-primary text-white shadow-xs"
                      : "bg-surface-subtle text-ink-secondary hover:bg-border-light"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>{style}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Season Selection */}
        <div>
          <label className="text-xs font-bold text-ink-primary block mb-1.5">
            Color Season & Palette
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COLOR_SEASONS.map((season) => {
              const isSelected = colorSeason === season.id;
              return (
                <div
                  key={season.id}
                  onClick={() => onColorSeasonChange(season.id)}
                  className={`p-2.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#F4ECE1] border-ink-primary ring-1 ring-ink-primary/20 shadow-xs"
                      : "bg-surface-subtle/30 border-border-light hover:border-border-subtle"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink-primary">
                      {season.id}
                    </span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-ink-primary text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-ink-muted mt-0.5 leading-tight">
                    {season.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Favorite Colors Palette */}
        <div>
          <label className="text-xs font-bold text-ink-primary block mb-1.5">
            Favorite Go-To Colors
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {PALETTE_COLORS.map((c) => {
              const isSelected = selectedColors.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => onToggleColor(c.name)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-ink-primary text-white border-ink-primary shadow-xs"
                      : "bg-white border-border-light text-ink-secondary hover:border-border-subtle"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[11px] font-semibold">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
