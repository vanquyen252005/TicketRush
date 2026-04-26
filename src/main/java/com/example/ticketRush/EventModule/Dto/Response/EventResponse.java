package com.example.ticketRush.EventModule.Dto.Response;

import com.example.ticketRush.EventModule.Enum.EventStatus;

import java.time.LocalDateTime;
import java.util.List;

public record EventResponse(
        Long id,
        String name,
        String description,
        String location,
        String imageUrl,
        LocalDateTime startTime,
        LocalDateTime endTime,
        EventStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<ZoneResponse> zones
) {
}
