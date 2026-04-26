package com.example.ticketRush.AdminModule.Dto.Response;

import java.math.BigDecimal;
import java.util.UUID;

public record AdminBookingItemResponse(
        UUID id,
        Long seat_id,
        String seat_label,
        String zone_name,
        String row_label,
        String seat_number,
        BigDecimal price_at_purchase
) {
}
