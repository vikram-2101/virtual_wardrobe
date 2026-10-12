import { apiClient } from "../../../services/api";
import { AvatarItem } from "../types";

export const listAvatars = async (): Promise<AvatarItem[]> => {
  const res = await apiClient.get<{ success: boolean; data: AvatarItem[] }>(
    "/api/avatars",
  );
  return res.data?.data || [];
};

export const getCanonicalAvatar = async (): Promise<AvatarItem | null> => {
  try {
    const res = await apiClient.get<{ success: boolean; data: AvatarItem }>(
      "/api/avatars/canonical",
    );
    return res.data?.data || null;
  } catch (err: any) {
    if (err.response?.status === 404) {
      return null;
    }
    throw err;
  }
};

export const uploadAvatar = async (file: File): Promise<AvatarItem> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post<{ success: boolean; data: AvatarItem }>(
    "/api/avatars/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data?.data;
};

export const setCanonicalAvatar = async (id: string): Promise<AvatarItem> => {
  const res = await apiClient.put<{ success: boolean; data: AvatarItem }>(
    `/api/avatars/${id}/canonical`,
  );
  return res.data?.data;
};

export const deleteAvatar = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/avatars/${id}`);
};
