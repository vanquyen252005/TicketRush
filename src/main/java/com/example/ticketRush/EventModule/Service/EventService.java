package com.example.ticketRush.EventModule.Service;

import com.example.ticketRush.EventModule.Dto.Request.EventRequest;
import com.example.ticketRush.EventModule.Dto.Request.EventSeatLayoutRequest;
import com.example.ticketRush.EventModule.Dto.Response.EventResponse;

import java.util.List;

public interface EventService {

    List<EventResponse> getAllEvents();

    EventResponse getEventById(Long eventId);

    EventResponse createEvent(EventRequest request);

    EventResponse updateEvent(Long eventId, EventRequest request);

    EventResponse updateSeatLayout(Long eventId, EventSeatLayoutRequest request);

    void deleteEvent(Long eventId);
}
