import { apiClient } from "../../../services/api";
import {
  OutfitResponse,
  AutomaticOutfitRequest,
  ControlledOutfitRequest,
  ManualOutfitRequest,
} from "../types";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

/**
 * Generate automatic outfit based on occasion and options.
 */
export const generateAutomaticOutfit = async (
  request: AutomaticOutfitRequest,
): Promise<OutfitResponse> => {
  const response = await apiClient.post<ApiResponse<OutfitResponse>>(
    "/api/outfits/generate-automatic",
    request,
  );
  return response.data.data;
};

/**
 * Generate controlled outfit constrained to specific user-selected categories.
 */
export const generateControlledOutfit = async (
  request: ControlledOutfitRequest,
): Promise<OutfitResponse> => {
  const response = await apiClient.post<ApiResponse<OutfitResponse>>(
    "/api/outfits/generate-controlled",
    request,
  );
  return response.data.data;
};

/**
 * Create a manual outfit from specific chosen wardrobe item IDs.
 */
export const createManualOutfit = async (
  request: ManualOutfitRequest,
): Promise<OutfitResponse> => {
  const response = await apiClient.post<ApiResponse<OutfitResponse>>(
    "/api/outfits",
    request,
  );
  return response.data.data;
};

/**
 * List outfits with optional filters (isFavorite, status, source).
 */
export const listOutfits = async (params?: {
  isFavorite?: boolean;
  status?: string;
  source?: string;
}): Promise<OutfitResponse[]> => {
  const response = await apiClient.get<ApiResponse<OutfitResponse[]>>(
    "/api/outfits",
    { params },
  );
  return response.data.data;
};

/**
 * Get single outfit by ID.
 */
export const getOutfit = async (id: string): Promise<OutfitResponse> => {
  const response = await apiClient.get<ApiResponse<OutfitResponse>>(
    `/api/outfits/${id}`,
  );
  return response.data.data;
};

/**
 * Toggle or set favorite status on an outfit.
 */
export const toggleFavoriteOutfit = async (
  id: string,
  isFavorite?: boolean,
): Promise<OutfitResponse> => {
  const params: Record<string, boolean> = {};
  if (isFavorite !== undefined) {
    params.isFavorite = isFavorite;
  }
  const response = await apiClient.put<ApiResponse<OutfitResponse>>(
    `/api/outfits/${id}/favorite`,
    null,
    { params },
  );
  return response.data.data;
};

/**
 * Mark outfit as SAVED.
 */
export const saveOutfit = async (id: string): Promise<OutfitResponse> => {
  const response = await apiClient.put<ApiResponse<OutfitResponse>>(
    `/api/outfits/${id}/save`,
  );
  return response.data.data;
};

/**
 * Mark outfit as REJECTED.
 */
export const rejectOutfit = async (id: string): Promise<OutfitResponse> => {
  const response = await apiClient.put<ApiResponse<OutfitResponse>>(
    `/api/outfits/${id}/reject`,
  );
  return response.data.data;
};

/**
 * Regenerate alternative permutation using original outfit's constraints.
 */
export const regenerateOutfit = async (id: string): Promise<OutfitResponse> => {
  const response = await apiClient.post<ApiResponse<OutfitResponse>>(
    `/api/outfits/${id}/regenerate`,
  );
  return response.data.data;
};

/**
 * Delete outfit by ID.
 */
export const deleteOutfit = async (id: string): Promise<void> => {
  await apiClient.delete<ApiResponse<void>>(`/api/outfits/${id}`);
};
