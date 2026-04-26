import apiClient from "../api-client";
import { DashboardStats } from "../types";

export const adminDashboardService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>("/api/admin/dashboard");
    return response.data;
  },
};
