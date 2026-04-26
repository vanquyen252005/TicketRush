package com.example.ticketRush.BookingModule.Dto.Request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record BookingHoldRequest(
        @NotNull(message = "Event id is required")
        Long eventId,

        @NotEmpty(message = "At least one seat must be selected")
        List<@NotNull(message = "Seat id is required") Long> seatIds
) {
}
