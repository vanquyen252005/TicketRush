import apiClient from "../api-client";
import { AdminBooking } from "../types";

export const adminBookingService = {
  getBookings: async (): Promise<AdminBooking[]> => {
    const response = await apiClient.get<AdminBooking[]>("/api/admin/bookings");
    return response.data;
  },

  getBookingById: async (bookingId: string): Promise<AdminBooking> => {
    const response = await apiClient.get<AdminBooking>(`/api/admin/bookings/${bookingId}`);
    return response.data;
  },
};
