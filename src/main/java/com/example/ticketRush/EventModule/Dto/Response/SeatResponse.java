package com.example.ticketRush.EventModule.Dto.Response;

import java.time.LocalDateTime;
import java.util.UUID;

public record SeatResponse(
        Long id,
        Long zone_id,
        String row_label,
        String seat_number,
        String status,
        LocalDateTime lock_expires_at,
        UUID locked_by_user_id,
        UUID user_id
) {
}
