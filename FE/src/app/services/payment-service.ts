import apiClient from "../api-client";
import { PaymentTransaction } from "../types";

export const paymentService = {
  getTransactionByBookingId: async (bookingId: string): Promise<PaymentTransaction> => {
    const response = await apiClient.get<PaymentTransaction>(`/api/payments/bookings/${bookingId}`);
    return response.data;
  },
};
