export interface GarmentItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  icon: "wardrobe" | "styling" | "tryon";
}
