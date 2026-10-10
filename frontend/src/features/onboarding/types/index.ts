export type FitType = "slim" | "regular" | "relaxed" | "oversized";

export type HeightUnit = "cm" | "ft" | "in";
export type WeightUnit = "kg" | "lbs";

export interface UploadedPhoto {
  id: string;
  url: string;
  isMain?: boolean;
}

export interface OnboardingPreferences {
  name: string;
  height: string;
  heightUnit: HeightUnit;
  weight: string;
  weightUnit: WeightUnit;
  preferredFit: FitType;
  photos: UploadedPhoto[];
  styles: string[];
  occasions: string[];
  colors: string[];
}

export interface StepInfo {
  id: number;
  label: string;
  shortDescription?: string;
}

export const ONBOARDING_STEPS: StepInfo[] = [
  { id: 1, label: "About You", shortDescription: "Basic info & body fit" },
  { id: 2, label: "Your Photo", shortDescription: "Try-on model avatar" },
  { id: 3, label: "Your Style", shortDescription: "Style preferences" },
  { id: 4, label: "Review", shortDescription: "Summary & confirmation" },
];
