export interface WardrobeCategory {
  id: string;
  name: string;
  itemCount: number;
  imageUrl?: string;
  icon?: string;
}

export interface OutfitIdea {
  id: string;
  title: string;
  tags: string[];
  imageUrl: string;
  isLiked?: boolean;
}

export interface ClothingItem {
  id: string;
  name: string;
  category: "tops" | "bottoms" | "outerwear" | "shoes" | "accessories";
  imageUrl: string;
  color?: string;
  brand?: string;
}

export type SidebarTab =
  | "home"
  | "wardrobe"
  | "tryon"
  | "stylist"
  | "outfits"
  | "profile"
  | "settings";
