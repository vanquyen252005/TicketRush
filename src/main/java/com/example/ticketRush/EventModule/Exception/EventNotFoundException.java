package com.example.ticketRush.EventModule.Exception;

public class EventNotFoundException extends RuntimeException {

    public EventNotFoundException(Long eventId) {
        super("Event not found with id: " + eventId);
    }
}
