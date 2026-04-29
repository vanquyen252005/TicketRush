package com.example.ticketRush.AdminModule.Service;

import com.example.ticketRush.AdminModule.Dto.Response.AdminBookingResponse;

import java.util.List;
import java.util.UUID;

public interface AdminBookingService {
    List<AdminBookingResponse> getBookings();

    List<AdminBookingResponse> getBookings(java.util.UUID userId);

    AdminBookingResponse getBooking(UUID bookingId);
}
