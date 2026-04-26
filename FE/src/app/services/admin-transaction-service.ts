import apiClient from "../api-client";
import { AdminPaymentTransaction } from "../types";

export const adminTransactionService = {
  getTransactions: async (): Promise<AdminPaymentTransaction[]> => {
    const response = await apiClient.get<AdminPaymentTransaction[]>("/api/admin/transactions");
    return response.data;
  },
};
