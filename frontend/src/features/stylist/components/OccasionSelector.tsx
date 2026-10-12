import React from "react";
import {
  Shirt,
  Briefcase,
  Award,
  GlassWater,
  Sun,
  Snowflake,
  Footprints,
  Layers,
} from "lucide-react";
import { OccasionType } from "../types";

export interface OccasionSelectorProps {
  selectedOccasion: OccasionType;
  onSelectOccasion: (occasion: OccasionType) => void;
  includeShoes: boolean;
  onToggleShoes: (include: boolean) => void;
  includeOuterwear: boolean;
  onToggleOuterwear: (include: boolean) => void;
}

const OCCASIONS: {
  id: OccasionType;
  label: string;
  icon: React.ReactNode;
  imageUrl?: string;
}[] = [
  {
    id: "CASUAL",
    label: "Casual",
    icon: <Shirt className="w-5 h-5" />,
    imageUrl: "/images/hero/3.jpg",
  },
  {
    id: "WORK",
    label: "Work",
    icon: <Briefcase className="w-5 h-5" />,
    imageUrl: "/images/hero/2.jpg",
  },
  {
    id: "FORMAL",
    label: "Formal",
    icon: <Award className="w-5 h-5" />,
    imageUrl: "/images/hero/1.jpg",
  },
  {
    id: "PARTY",
    label: "Party",
    icon: <GlassWater className="w-5 h-5" />,
    imageUrl: "/images/hero/6.jpg",
  },
  {
    id: "SUMMER",
    label: "Summer",
    icon: <Sun className="w-5 h-5 text-amber-500" />,
    imageUrl: "/images/hero/4.jpg",
  },
  {
    id: "WINTER",
    label: "Winter",
    icon: <Snowflake className="w-5 h-5 text-blue-400" />,
    imageUrl: "/images/hero/5.jpg",
  },
];

export const OccasionSelector: React.FC<OccasionSelectorProps> = ({
  selectedOccasion,
  onSelectOccasion,
  includeShoes,
  onToggleShoes,
  includeOuterwear,
  onToggleOuterwear,
}) => {
  return (
    <div className="w-full bg-white rounded-3xl border border-border-light shadow-card p-4 sm:p-5 text-left animate-fadeIn">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
        {/* 1. Left: Occasion Cards */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-ink-primary tracking-wide">
              1. Select an Occasion:
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
            {OCCASIONS.map((occ) => {
              const isSelected = selectedOccasion === occ.id;

              return (
                <button
                  key={occ.id}
                  type="button"
                  onClick={() => onSelectOccasion(occ.id)}
                  className={`flex flex-col items-center p-2 sm:p-2.5 rounded-2xl border transition-all text-center focus:outline-none cursor-pointer ${
                    isSelected
                      ? "bg-[#F4ECE1] border-ink-primary shadow-xs ring-1 ring-ink-primary/20 scale-[1.02]"
                      : "bg-surface-subtle/30 border-border-light hover:border-border-subtle hover:bg-surface-subtle/70"
                  }`}
                >
                  {/* Thumbnail Container */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white flex items-center justify-center mb-1.5 overflow-hidden shadow-2xs p-1">
                    {occ.imageUrl ? (
                      <img
                        src={occ.imageUrl}
                        alt={occ.label}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      occ.icon
                    )}
                  </div>

                  <span className="text-xs font-bold text-ink-primary truncate w-full">
                    {occ.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Right: Rich 2-Row Additional Options */}
        <div className="lg:border-l lg:border-border-light/70 lg:pl-5 flex flex-col justify-center gap-2.5 shrink-0 min-w-[280px] sm:min-w-[310px]">
          {/* Options Header */}
          <span className="text-xs font-bold text-ink-primary tracking-wide">
            2. Additional Options:
          </span>

          {/* 2-Row Toggle Card */}
          <div className="flex flex-col gap-2 bg-surface-subtle/40 border border-border-light/80 p-2.5 rounded-2xl">
            {/* Row 1: Include Shoes */}
            <div
              onClick={() => onToggleShoes(!includeShoes)}
              className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white border border-border-light/60 hover:border-border-subtle cursor-pointer transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF5ED] flex items-center justify-center text-ink-primary shrink-0 border border-amber-900/10">
                  <Footprints className="w-4 h-4 text-ink-primary" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-bold text-ink-primary">
                    Include Shoes
                  </span>
                  <span className="text-[10px] text-ink-muted">
                    Add matching shoes to outfit
                  </span>
                </div>
              </div>

              {/* iOS Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={includeShoes}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleShoes(!includeShoes);
                }}
                className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative p-0.5 focus:outline-none cursor-pointer shrink-0 ${
                  includeShoes ? "bg-ink-primary" : "bg-neutral-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                    includeShoes ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Row 2: Include Outerwear */}
            <div
              onClick={() => onToggleOuterwear(!includeOuterwear)}
              className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white border border-border-light/60 hover:border-border-subtle cursor-pointer transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF5ED] flex items-center justify-center text-ink-primary shrink-0 border border-amber-900/10">
                  <Layers className="w-4 h-4 text-ink-primary" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-bold text-ink-primary">
                    Include Outerwear
                  </span>
                  <span className="text-[10px] text-ink-muted">
                    Add jacket or coat if needed
                  </span>
                </div>
              </div>

              {/* iOS Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={includeOuterwear}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleOuterwear(!includeOuterwear);
                }}
                className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative p-0.5 focus:outline-none cursor-pointer shrink-0 ${
                  includeOuterwear ? "bg-ink-primary" : "bg-neutral-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                    includeOuterwear ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
