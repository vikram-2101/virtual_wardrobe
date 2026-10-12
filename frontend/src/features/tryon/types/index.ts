import { ClothingCategory } from "../../wardrobe/types";
import { OutfitResponse, OutfitItemDetail } from "../../stylist/types";

export type TryOnMode = "outfit" | "single";
export type ViewMode = "side-by-side" | "before-after";

export interface AvatarItem {
  id: string;
  userId: string;
  imageUrl: string;
  imageKey?: string;
  isCanonical: boolean;
  heightCm?: number;
  weightKg?: number;
  bodyShape?: string;
  createdAt: string;
}

export interface TryOnDisplayItem {
  id: string;
  category: ClothingCategory;
  subcategory?: string;
  color?: string;
  size?: string;
  brand?: string;
  imageUrl?: string;
}

export interface TryOnJob {
  id: string;
  userId: string;
  outfitId?: string;
  avatarId?: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  resultImageUrl?: string;
  resultImageKey?: string;
  originalImageUrl?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
  outfit?: OutfitResponse;
  items?: (OutfitItemDetail | TryOnDisplayItem)[];
}

export interface CreateTryOnRequest {
  outfitId: string;
  avatarId?: string;
}

export interface CreateSingleItemTryOnRequest {
  itemId: string;
  avatarId?: string;
}
