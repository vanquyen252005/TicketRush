import apiClient from "../api-client";
import { User, AuthResponse, RegisterData, LoginData } from "../types";

export const authService = {
  register: async (data: RegisterData): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>("/api/auth/register", data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/api/auth/login", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/api/auth/logout");
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>("/api/auth/me");
    return response.data;
  },

  loginWithGoogle: async (idToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/api/auth/google", { idToken });
    return response.data;
  }
};
