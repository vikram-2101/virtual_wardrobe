import { apiClient } from "../../../services/api";
import {
  WardrobeItem,
  SuggestMetadataResponse,
  ClothingCategory,
} from "../types";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

/**
 * Fetch all wardrobe items for the authenticated user, optionally filtered by category.
 */
export const listWardrobeItems = async (
  category?: ClothingCategory | "ALL",
): Promise<WardrobeItem[]> => {
  const params: Record<string, string> = {};
  if (category && category !== "ALL") {
    params.category = category;
  }

  const response = await apiClient.get<ApiResponse<WardrobeItem[]>>(
    "/api/wardrobe/items",
    { params },
  );
  return response.data.data;
};

/**
 * Get a single wardrobe item by UUID.
 */
export const getWardrobeItem = async (id: string): Promise<WardrobeItem> => {
  const response = await apiClient.get<ApiResponse<WardrobeItem>>(
    `/api/wardrobe/items/${id}`,
  );
  return response.data.data;
};

/**
 * Create a new wardrobe item with uploaded image(s) and metadata.
 */
export const createWardrobeItem = async (
  formData: FormData,
): Promise<WardrobeItem> => {
  const response = await apiClient.post<ApiResponse<WardrobeItem>>(
    "/api/wardrobe/items",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data.data;
};

/**
 * AI Metadata Suggestion: Extracts clothing category, color, fit, season from an image.
 */
export const suggestClothingMetadata = async (
  imageFile: File,
): Promise<SuggestMetadataResponse> => {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await apiClient.post<ApiResponse<SuggestMetadataResponse>>(
    "/api/wardrobe/suggest-metadata",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data.data;
};

/**
 * Update metadata or images for an existing wardrobe item.
 */
export const updateWardrobeItem = async (
  id: string,
  formData: FormData,
): Promise<WardrobeItem> => {
  const response = await apiClient.put<ApiResponse<WardrobeItem>>(
    `/api/wardrobe/items/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data.data;
};

/**
 * Delete a wardrobe item by ID.
 */
export const deleteWardrobeItem = async (id: string): Promise<void> => {
  await apiClient.delete<ApiResponse<void>>(`/api/wardrobe/items/${id}`);
};
