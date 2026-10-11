import React from "react";
import { WardrobeCategorySummary } from "../types";

export interface WardrobeStatsCardProps {
  categories: WardrobeCategorySummary[];
  totalItems: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  TOPS: "#4F75FF",
  BOTTOMS: "#58A399",
  OUTERWEAR: "#8E7DBE",
  SHOES: "#E6B325",
  ACCESSORIES: "#D97706",
  DRESSES: "#E879F9",
};

export const WardrobeStatsCard: React.FC<WardrobeStatsCardProps> = ({
  categories,
  totalItems,
}) => {
  // Calculate SVG stroke dashes for donut chart
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const validCategories = categories.filter(
    (c) => c.category !== "ALL" && c.count > 0,
  );

  return (
    <div className="w-full bg-white rounded-3xl border border-border-light shadow-card p-5 sm:p-6 text-left">
      <h3 className="text-sm sm:text-base font-bold text-ink-primary mb-4">
        Wardrobe Stats
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* Donut Chart Visual */}
        <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 130 130"
          >
            {/* Background Circle */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="transparent"
              stroke="#F3EDE4"
              strokeWidth="14"
            />

            {/* Category Segment Arcs */}
            {validCategories.map((cat) => {
              const percent = totalItems > 0 ? cat.count / totalItems : 0;
              const strokeDasharray = `${percent * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;
              accumulatedPercent += percent;

              const strokeColor =
                CATEGORY_COLORS[cat.category] || cat.color || "#8A929A";

              return (
                <circle
                  key={cat.category}
                  cx="65"
                  cy="65"
                  r={radius}
                  fill="transparent"
                  stroke={strokeColor}
                  strokeWidth="14"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 ease-out"
                />
              );
            })}
          </svg>

          {/* Center Total Count Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span className="text-2xl font-bold text-ink-primary font-sans leading-none">
              {totalItems}
            </span>
            <span className="text-[10px] font-semibold text-ink-secondary tracking-tight mt-1">
              Total Items
            </span>
          </div>
        </div>

        {/* Legend Breakdown List */}
        <div className="flex-1 w-full space-y-2">
          {categories
            .filter((c) => c.category !== "ALL")
            .map((cat) => {
              const dotColor =
                CATEGORY_COLORS[cat.category] || cat.color || "#8A929A";
              return (
                <div
                  key={cat.category}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className="text-ink-secondary font-medium">
                      {cat.label}
                    </span>
                  </div>
                  <span className="font-bold text-ink-primary font-mono text-xs">
                    {cat.count}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
