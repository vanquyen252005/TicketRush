import apiClient from "../api-client";
import { AdminPaymentTransaction } from "../types";

export const adminTransactionService = {
  getTransactions: async (userId?: string): Promise<AdminPaymentTransaction[]> => {
    const response = await apiClient.get<AdminPaymentTransaction[]>("/api/admin/transactions", {
      params: userId ? { userId } : undefined,
    });
    return response.data;
  },
};
