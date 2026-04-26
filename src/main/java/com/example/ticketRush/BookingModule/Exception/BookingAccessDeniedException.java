package com.example.ticketRush.BookingModule.Exception;

public class BookingAccessDeniedException extends RuntimeException {

    public BookingAccessDeniedException(String message) {
        super(message);
    }
}
