import { apiClient } from "../../../services/api";
import {
  TryOnJob,
  CreateTryOnRequest,
  CreateSingleItemTryOnRequest,
} from "../types";

export const createTryOnJob = async (
  payload: CreateTryOnRequest,
): Promise<TryOnJob> => {
  const res = await apiClient.post<{ success: boolean; data: TryOnJob }>(
    "/api/try-ons",
    payload,
  );
  return res.data?.data;
};

export const createSingleItemTryOnJob = async (
  payload: CreateSingleItemTryOnRequest,
): Promise<TryOnJob> => {
  const res = await apiClient.post<{ success: boolean; data: TryOnJob }>(
    "/api/try-ons/single-item",
    payload,
  );
  return res.data?.data;
};

export const listTryOnJobs = async (status?: string): Promise<TryOnJob[]> => {
  const params = status ? { status } : {};
  const res = await apiClient.get<{ success: boolean; data: TryOnJob[] }>(
    "/api/try-ons",
    { params },
  );
  return res.data?.data || [];
};

export const getTryOnJob = async (jobId: string): Promise<TryOnJob> => {
  const res = await apiClient.get<{ success: boolean; data: TryOnJob }>(
    `/api/try-ons/${jobId}`,
  );
  return res.data?.data;
};
