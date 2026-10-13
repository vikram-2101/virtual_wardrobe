import { OccasionType } from "../../stylist/types";

export type LookbookTab = "all" | "favorites" | "collections";

export interface OutfitCollection {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  outfitCount: number;
  createdAt: string;
}

export interface LookbookFilterState {
  searchQuery: string;
  occasion: OccasionType | "ALL";
  season: string;
  sortBy: "RECENT" | "FAVORITES" | "NAME";
  viewMode: "grid" | "list";
}
