package com.example.ticketRush.EventModule.Mapper;

import com.example.ticketRush.EventModule.Dto.Request.EventRequest;
import com.example.ticketRush.EventModule.Dto.Response.EventResponse;
import com.example.ticketRush.EventModule.Entity.Event;

import java.util.Collections;

public final class EventMapper {

    private EventMapper() {
    }

    public static EventResponse toResponse(Event event) {
        return toResponse(event, Collections.emptyList());
    }

    public static EventResponse toDetailedResponse(Event event) {
        return toResponse(event, ZoneMapper.toResponses(event.getZones(), event.getId()));
    }

    private static EventResponse toResponse(Event event, java.util.List<com.example.ticketRush.EventModule.Dto.Response.ZoneResponse> zones) {
        return new EventResponse(
                event.getId(),
                event.getName(),
                event.getDescription(),
                event.getLocation(),
                event.getImageUrl(),
                event.getStartTime(),
                event.getEndTime(),
                event.getStatus(),
                event.getCreatedAt(),
                event.getUpdatedAt(),
                zones
        );
    }

    public static void updateEntity(Event event, EventRequest request) {
        event.setName(request.name());
        event.setDescription(request.description());
        event.setLocation(request.location());
        event.setImageUrl(request.imageUrl());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setStatus(request.status());
    }
}
