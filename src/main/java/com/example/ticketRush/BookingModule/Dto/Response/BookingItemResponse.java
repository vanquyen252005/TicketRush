package com.example.ticketRush.BookingModule.Dto.Response;

import java.math.BigDecimal;
import java.util.UUID;

public record BookingItemResponse(
        UUID id,
        UUID booking_id,
        Long seat_id,
        String seat_label,
        BigDecimal price_at_purchase,
        String ticket_code,
        String check_in_status,
        String checked_in_at
) {
}
