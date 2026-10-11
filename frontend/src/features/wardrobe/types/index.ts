export type ClothingCategory =
  | "TOPS"
  | "BOTTOMS"
  | "OUTERWEAR"
  | "SHOES"
  | "ACCESSORIES"
  | "DRESSES";

export interface WardrobeImage {
  id: string;
  imageKey: string;
  imageUrl: string;
  viewType: "FRONT" | "BACK" | "PROCESSED" | "SEGMENTED";
  createdAt: string;
}

export interface WardrobeItem {
  id: string;
  userId: string;
  category: ClothingCategory;
  subcategory?: string;
  color: string;
  pattern?: string;
  fit?: string;
  material?: string;
  season?: string;
  notes?: string;
  images: WardrobeImage[];
  createdAt: string;
  updatedAt: string;
  // UI helper fields
  isFavorite?: boolean;
  size?: string;
  brand?: string;
}

export interface CreateWardrobeItemInput {
  category: ClothingCategory;
  subcategory?: string;
  color: string;
  pattern?: string;
  fit?: string;
  material?: string;
  season?: string;
  notes?: string;
  frontImage: File;
  backImage?: File;
}

export interface SuggestMetadataResponse {
  category: ClothingCategory;
  subCategory?: string;
  color: string;
  pattern?: string;
  fit?: string;
  season?: string;
  confidence?: number;
  detectedTags?: string[];
  isAiGenerated?: boolean;
}

export interface WardrobeCategorySummary {
  category: ClothingCategory | "ALL";
  label: string;
  count: number;
  iconName?: string;
  imageUrl?: string;
  color: string;
}

export type SortOption = "newest" | "oldest" | "category" | "color";
