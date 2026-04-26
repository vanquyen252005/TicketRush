package com.example.ticketRush.BookingModule.Exception;

public class BookingExpiredException extends RuntimeException {

    public BookingExpiredException(String message) {
        super(message);
    }
}
