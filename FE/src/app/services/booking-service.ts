import apiClient from "../api-client";
import { Booking } from "../types";

export interface BookingHoldRequest {
  eventId: number;
  seatIds: number[];
}

export const bookingService = {
  holdSeats: async (request: BookingHoldRequest): Promise<Booking> => {
    const response = await apiClient.post<Booking>("/api/bookings/hold", request);
    return response.data;
  },

  getBookingById: async (bookingId: string): Promise<Booking> => {
    const response = await apiClient.get<Booking>(`/api/bookings/${bookingId}`);
    return response.data;
  },

  confirmBooking: async (bookingId: string): Promise<Booking> => {
    const response = await apiClient.post<Booking>(`/api/bookings/${bookingId}/confirm`);
    return response.data;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>("/api/bookings/me");
    return response.data;
  },
};
