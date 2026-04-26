package com.example.ticketRush.BookingModule.Exception;

import java.util.UUID;

public class BookingNotFoundException extends RuntimeException {

    public BookingNotFoundException(UUID bookingId) {
        super("Booking not found with id: " + bookingId);
    }
}
