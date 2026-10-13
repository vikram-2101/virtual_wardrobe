import { apiClient } from "../../../services/api";
import { UserProfile, UpdateProfileInput } from "../types";

export const getCurrentUserProfile = async (): Promise<UserProfile> => {
  const res = await apiClient.get<{ success: boolean; data: UserProfile }>(
    "/api/users/me",
  );
  return res.data?.data;
};

export const updateUserProfile = async (
  input: UpdateProfileInput,
): Promise<UserProfile> => {
  const res = await apiClient.put<{ success: boolean; data: UserProfile }>(
    "/api/users/me",
    input,
  );
  return res.data?.data;
};
