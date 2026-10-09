import { GarmentItem, FeatureItem } from "../types";

/**
 * 6 preview items displayed inside the floating "Your Wardrobe" card.
 */
export const HERO_WARDROBE_ITEMS: GarmentItem[] = [
  {
    id: "item-1",
    name: "Striped Knit Sweater",
    category: "TOPS",
    imageUrl: "/images/hero/1.jpg",
  },
  {
    id: "item-2",
    name: "Classic White Tee",
    category: "TOPS",
    imageUrl: "/images/hero/2.jpg",
  },
  {
    id: "item-3",
    name: "Straight Cut Denim",
    category: "BOTTOMS",
    imageUrl: "/images/hero/3.jpg",
  },
  {
    id: "item-4",
    name: "Oversized Wool Blazer",
    category: "OUTERWEAR",
    imageUrl: "/images/hero/4.jpg",
  },
  {
    id: "item-5",
    name: "Minimalist Sand Hoodie",
    category: "TOPS",
    imageUrl: "/images/hero/5.jpg",
  },
  {
    id: "item-6",
    name: "Retro Leather Sneakers",
    category: "SHOES",
    imageUrl: "/images/hero/6.jpg",
  },
];

/**
 * Feature highlights positioned under the left CTA buttons.
 */
export const HERO_FEATURES: FeatureItem[] = [
  {
    id: "feat-wardrobe",
    title: "Your Wardrobe",
    subtitle: "Upload & organize",
    icon: "wardrobe",
  },
  {
    id: "feat-styling",
    title: "AI Styling",
    subtitle: "Create outfit ideas",
    icon: "styling",
  },
  {
    id: "feat-tryon",
    title: "Virtual Try-On",
    subtitle: "See it on you",
    icon: "tryon",
  },
];
