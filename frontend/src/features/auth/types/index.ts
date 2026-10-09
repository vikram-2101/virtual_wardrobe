export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  height?: number;
  weight?: number;
  gender?: "MALE" | "FEMALE" | "UNSPECIFIED";
}

export interface GoogleAuthRequest {
  email: string;
  name: string;
  googleId?: string;
  avatarUrl?: string;
}

export interface AuthData {
  token: string;
  type: string;
  userId: string;
  email: string;
  name: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}
