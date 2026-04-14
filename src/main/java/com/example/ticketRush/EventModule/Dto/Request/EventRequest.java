package com.example.ticketRush.EventModule.Dto.Request;

import com.example.ticketRush.EventModule.Enum.EventStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record EventRequest(
        @NotBlank(message = "Event name is required")
        @Size(max = 255, message = "Event name must be at most 255 characters")
        String name,

        @Size(max = 5000, message = "Description must be at most 5000 characters")
        String description,

        @NotBlank(message = "Location is required")
        @Size(max = 255, message = "Location must be at most 255 characters")
        String location,

        @Size(max = 1000, message = "Image URL must be at most 1000 characters")
        String imageUrl,

        @NotNull(message = "Start time is required")
        @FutureOrPresent(message = "Start time must be in the present or future")
        LocalDateTime startTime,

        LocalDateTime endTime,

        @NotNull(message = "Status is required")
        EventStatus status
) {
}
