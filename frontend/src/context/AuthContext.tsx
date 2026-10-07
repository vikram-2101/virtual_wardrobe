import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import {
  LoginRequest,
  RegisterRequest,
  GoogleAuthRequest,
  AuthData,
} from "../features/auth/types";

interface User {
  userId: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<AuthData>;
  register: (payload: RegisterRequest) => Promise<AuthData>;
  loginWithGoogle: (payload: GoogleAuthRequest) => Promise<AuthData>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Rehydrate auth state from localStorage on load
  useEffect(() => {
    const savedToken = localStorage.getItem("fitme_token");
    const savedUser = localStorage.getItem("fitme_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Failed to parse saved user state:", err);
        localStorage.removeItem("fitme_token");
        localStorage.removeItem("fitme_user");
      }
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (data: AuthData) => {
    const userData: User = {
      userId: data.userId,
      email: data.email,
      name: data.name,
    };
    setToken(data.token);
    setUser(userData);
    localStorage.setItem("fitme_token", data.token);
    localStorage.setItem("fitme_user", JSON.stringify(userData));
  };

  const login = async (payload: LoginRequest): Promise<AuthData> => {
    const data = await authService.login(payload);
    handleAuthSuccess(data);
    return data;
  };

  const register = async (payload: RegisterRequest): Promise<AuthData> => {
    const data = await authService.register(payload);
    handleAuthSuccess(data);
    return data;
  };

  const loginWithGoogle = async (
    payload: GoogleAuthRequest,
  ): Promise<AuthData> => {
    const data = await authService.loginWithGoogle(payload);
    handleAuthSuccess(data);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("fitme_token");
    localStorage.removeItem("fitme_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
