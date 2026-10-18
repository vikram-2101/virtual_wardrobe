import axios from "axios";

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8080";

/**
 * Standard Axios instance configured with JWT request interceptor.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Bearer token from localStorage to every outbound request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("fitme_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface HealthResponse {
  status: string;
  service: string;
  version?: string;
  dependencies?: Record<string, string>;
}

export const checkBackendHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>("/api/health");
  return response.data;
};

export const AI_SERVICE_BASE_URL =
  (import.meta as any).env?.VITE_AI_SERVICE_URL || "http://localhost:8000";

export const checkAiServiceHealth = async (): Promise<HealthResponse> => {
  const response = await axios.get<HealthResponse>(
    `${AI_SERVICE_BASE_URL}/api/ai/health`,
  );
  return response.data;
};

