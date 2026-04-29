import apiClient from "../api-client";
import { AdminDashboardTransactionFeed, DashboardStats } from "../types";

export const adminDashboardService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>("/api/admin/dashboard");
    return response.data;
  },
  getLiveTransactions: async (limit = 8): Promise<AdminDashboardTransactionFeed> => {
    const response = await apiClient.get<AdminDashboardTransactionFeed>("/api/admin/dashboard/transactions/live", {
      params: { limit },
    });
    return response.data;
  },
};
