import { apiClient } from "./api";
import {
  LoginRequest,
  RegisterRequest,
  GoogleAuthRequest,
  AuthData,
  ApiResponse,
} from "../features/auth/types";

export const authService = {
  /**
   * Log in user with email and password.
   */
  async login(payload: LoginRequest): Promise<AuthData> {
    const response = await apiClient.post<ApiResponse<AuthData>>(
      "/api/auth/login",
      payload,
    );
    return response.data.data;
  },

  /**
   * Register a new user account.
   */
  async register(payload: RegisterRequest): Promise<AuthData> {
    const response = await apiClient.post<ApiResponse<AuthData>>(
      "/api/auth/register",
      payload,
    );
    return response.data.data;
  },

  /**
   * Sign in or provision account with Google OAuth credentials.
   */
  async loginWithGoogle(payload: GoogleAuthRequest): Promise<AuthData> {
    const response = await apiClient.post<ApiResponse<AuthData>>(
      "/api/auth/google",
      payload,
    );
    return response.data.data;
  },
};
