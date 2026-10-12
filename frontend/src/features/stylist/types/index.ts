import { ClothingCategory } from "../../wardrobe/types";

export type StylistMode = "occasion" | "controlled" | "manual";

export type OccasionType =
  | "CASUAL"
  | "WORK"
  | "FORMAL"
  | "PARTY"
  | "SUMMER"
  | "WINTER"
  | "MINIMAL"
  | "LOUNGEWEAR"
  | "ACTIVEWEAR";

export interface OutfitItemDetail {
  id: string;
  userId: string;
  category: ClothingCategory;
  subcategory?: string;
  color?: string;
  primaryImageUrl?: string;
  images?: {
    id: string;
    imageUrl: string;
    viewType: string;
  }[];
}

export interface OutfitResponse {
  id: string;
  userId: string;
  name: string;
  source: "MANUAL" | "CONTROLLED_GENERATION" | "AUTOMATIC_RULE_ENGINE";
  status?: "SAVED" | "REJECTED" | "DRAFT" | "ARCHIVED";
  occasion?: OccasionType | null;
  isFavorite: boolean;
  items: OutfitItemDetail[];
  createdAt: string;
  updatedAt?: string;
}

export interface AutomaticOutfitRequest {
  occasion: OccasionType;
  season?: string;
  includeShoes?: boolean;
  includeOuterwear?: boolean;
  name?: string;
}

export interface ControlledOutfitRequest {
  name?: string;
  categories: ClothingCategory[];
}

export interface ManualOutfitRequest {
  name: string;
  itemIds: string[];
}
