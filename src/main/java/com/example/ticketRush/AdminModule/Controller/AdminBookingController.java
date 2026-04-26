package com.example.ticketRush.AdminModule.Controller;

import com.example.ticketRush.AdminModule.Dto.Response.AdminBookingResponse;
import com.example.ticketRush.AdminModule.Service.AdminBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/bookings")
public class AdminBookingController {

    private final AdminBookingService adminBookingService;

    @GetMapping
    public List<AdminBookingResponse> getBookings() {
        return adminBookingService.getBookings();
    }

    @GetMapping("/{bookingId}")
    public AdminBookingResponse getBooking(@PathVariable UUID bookingId) {
        return adminBookingService.getBooking(bookingId);
    }
}
