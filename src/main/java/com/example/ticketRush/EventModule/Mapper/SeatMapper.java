package com.example.ticketRush.EventModule.Mapper;

import com.example.ticketRush.EventModule.Dto.Response.SeatResponse;
import com.example.ticketRush.EventModule.Entity.Seat;
import com.example.ticketRush.EventModule.Enum.SeatStatus;

import java.util.Collection;
import java.util.List;

public final class SeatMapper {

    private SeatMapper() {
    }

    public static SeatResponse toResponse(Seat seat) {
        boolean available = seat.isAvailable();
        String status = available
                ? "AVAILABLE"
                : seat.getStatus() == SeatStatus.SOLD ? "BOOKED" : "LOCKED";

        return new SeatResponse(
                seat.getId(),
                seat.getZone() != null ? seat.getZone().getId() : null,
                seat.getRowLabel(),
                seat.getSeatNumber(),
                status,
                seat.getLockExpiresAt(),
                seat.getStatus() == SeatStatus.LOCKED && !available && seat.getUser() != null ? seat.getUser().getId() : null,
                seat.getStatus() == SeatStatus.SOLD && seat.getUser() != null ? seat.getUser().getId() : null
        );
    }

    public static List<SeatResponse> toResponses(Collection<Seat> seats) {
        if (seats == null || seats.isEmpty()) {
            return List.of();
        }

        return seats.stream()
                .map(SeatMapper::toResponse)
                .toList();
    }
}
