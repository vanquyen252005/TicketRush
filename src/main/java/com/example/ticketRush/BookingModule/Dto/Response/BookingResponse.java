package com.example.ticketRush.BookingModule.Dto.Response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record BookingResponse(
        UUID id,
        UUID user_id,
        Long event_id,
        BigDecimal total_amount,
        String status,
        String payment_transaction_id,
        LocalDateTime expires_at,
        LocalDateTime created_at,
        LocalDateTime updated_at,
        List<BookingItemResponse> items
) {
}
