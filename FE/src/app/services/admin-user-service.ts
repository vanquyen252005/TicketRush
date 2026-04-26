import apiClient from "../api-client";
import { AdminUserDetail, AdminUserSummary } from "../types";

export const adminUserService = {
  getUsers: async (): Promise<AdminUserSummary[]> => {
    const response = await apiClient.get<AdminUserSummary[]>("/api/admin/users");
    return response.data;
  },

  getUserById: async (userId: string): Promise<AdminUserDetail> => {
    const response = await apiClient.get<AdminUserDetail>(`/api/admin/users/${userId}`);
    return response.data;
  },
};
