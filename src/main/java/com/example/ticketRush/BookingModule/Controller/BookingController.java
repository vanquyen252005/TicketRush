package com.example.ticketRush.BookingModule.Controller;

import com.example.ticketRush.BookingModule.Dto.Request.BookingHoldRequest;
import com.example.ticketRush.BookingModule.Dto.Response.BookingResponse;
import com.example.ticketRush.BookingModule.Service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/hold")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse holdSeats(
            @Valid @RequestBody BookingHoldRequest request,
            Authentication authentication
    ) {
        return bookingService.holdSeats(authentication, request);
    }

    @GetMapping("/{bookingId}")
    public BookingResponse getBooking(
            @PathVariable UUID bookingId,
            Authentication authentication
    ) {
        return bookingService.getBookingById(authentication, bookingId);
    }

    @PostMapping("/{bookingId}/confirm")
    public BookingResponse confirmBooking(
            @PathVariable UUID bookingId,
            Authentication authentication
    ) {
        return bookingService.confirmBooking(authentication, bookingId);
    }

    @GetMapping("/me")
    public List<BookingResponse> getMyBookings(Authentication authentication) {
        return bookingService.getMyBookings(authentication);
    }
}
