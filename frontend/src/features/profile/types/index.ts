export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  height?: number;
  weight?: number;
  gender?: string;
  stylePreferences?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParsedStylePreferences {
  aesthetics: string[];
  colorSeason: string;
  favoriteColors: string[];
  favoriteBrands: string[];
  fitPreference: string;
}

export interface UpdateProfileInput {
  name?: string;
  height?: number;
  weight?: number;
  gender?: string;
  stylePreferences?: string;
}
