import { apiFetch } from "../api-client";
import { User, AuthResponse, RegisterData, LoginData } from "../types";

export const authService = {
  register: async (data: RegisterData): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  logout: async (): Promise<void> => {
    return apiFetch<void>("/api/auth/logout", {
      method: "POST"
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return apiFetch<User>("/api/auth/me");
  },

  loginWithGoogle: async (idToken: string): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  }
};

