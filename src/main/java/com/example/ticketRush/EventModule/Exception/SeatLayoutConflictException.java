package com.example.ticketRush.EventModule.Exception;

public class SeatLayoutConflictException extends RuntimeException {
    public SeatLayoutConflictException(String message) {
        super(message);
    }
}
