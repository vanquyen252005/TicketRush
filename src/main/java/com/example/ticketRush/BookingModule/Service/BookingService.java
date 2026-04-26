package com.example.ticketRush.BookingModule.Service;

import com.example.ticketRush.BookingModule.Dto.Request.BookingHoldRequest;
import com.example.ticketRush.BookingModule.Dto.Response.BookingResponse;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface BookingService {

    BookingResponse holdSeats(Authentication authentication, BookingHoldRequest request);

    BookingResponse getBookingById(Authentication authentication, UUID bookingId);

    BookingResponse confirmBooking(Authentication authentication, UUID bookingId);

    List<BookingResponse> getMyBookings(Authentication authentication);
}
