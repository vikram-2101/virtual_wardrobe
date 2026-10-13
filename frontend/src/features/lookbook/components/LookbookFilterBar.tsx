import React from "react";
import { Search, LayoutGrid, List } from "lucide-react";
import { OccasionType } from "../../stylist/types";

export interface LookbookFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  occasion: OccasionType | "ALL";
  onOccasionChange: (occ: OccasionType | "ALL") => void;
  season: string;
  onSeasonChange: (season: string) => void;
  sortBy: "RECENT" | "FAVORITES" | "NAME";
  onSortByChange: (sort: "RECENT" | "FAVORITES" | "NAME") => void;
  viewMode: "grid" | "list";
  onViewModeChange: (view: "grid" | "list") => void;
}

export const LookbookFilterBar: React.FC<LookbookFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  occasion,
  onOccasionChange,
  season,
  onSeasonChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 animate-fadeIn">
      {/* Fixed Search Bar with proper padding and icon alignment */}
      <div className="relative flex-1 min-w-[220px] max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search outfits, occasions, pieces..."
          className="w-full bg-white text-ink-primary text-xs rounded-xl border border-border-light focus:border-ink-primary pl-9 pr-3.5 py-2.5 shadow-2xs focus:outline-none transition-all placeholder:text-ink-muted leading-normal"
        />
      </div>

      {/* Dropdown Filters & View Switcher */}
      <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
        {/* Occasion Filter */}
        <select
          value={occasion}
          onChange={(e) =>
            onOccasionChange(e.target.value as OccasionType | "ALL")
          }
          className="bg-white text-ink-primary text-xs rounded-xl border border-border-light px-3 py-2.5 shadow-2xs focus:outline-none focus:border-ink-primary cursor-pointer"
        >
          <option value="ALL">Occasion: All</option>
          <option value="CASUAL">Casual</option>
          <option value="WORK">Work</option>
          <option value="FORMAL">Formal</option>
          <option value="PARTY">Party</option>
          <option value="SUMMER">Summer</option>
          <option value="WINTER">Winter</option>
        </select>

        {/* Season Filter */}
        <select
          value={season}
          onChange={(e) => onSeasonChange(e.target.value)}
          className="bg-white text-ink-primary text-xs rounded-xl border border-border-light px-3 py-2.5 shadow-2xs focus:outline-none focus:border-ink-primary cursor-pointer"
        >
          <option value="ALL">Season: All</option>
          <option value="Spring">Spring</option>
          <option value="Summer">Summer</option>
          <option value="Fall">Fall</option>
          <option value="Winter">Winter</option>
          <option value="All Season">All Season</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) =>
            onSortByChange(e.target.value as "RECENT" | "FAVORITES" | "NAME")
          }
          className="bg-white text-ink-primary text-xs rounded-xl border border-border-light px-3 py-2.5 shadow-2xs focus:outline-none focus:border-ink-primary cursor-pointer"
        >
          <option value="RECENT">Sort: Recently Saved</option>
          <option value="FAVORITES">Favorites First</option>
          <option value="NAME">Name (A-Z)</option>
        </select>

        {/* View Mode Toggle */}
        <div className="inline-flex items-center p-0.5 bg-white rounded-xl border border-border-light shadow-2xs">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-ink-primary text-white shadow-2xs"
                : "text-ink-muted hover:text-ink-primary"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "list"
                ? "bg-ink-primary text-white shadow-2xs"
                : "text-ink-muted hover:text-ink-primary"
            }`}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
