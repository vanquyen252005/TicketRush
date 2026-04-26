package com.example.ticketRush.AdminModule.Dto.Response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record AdminBookingResponse(
        UUID id,
        UUID user_id,
        String user_full_name,
        String user_email,
        String user_phone_number,
        Long event_id,
        String event_name,
        String event_location,
        BigDecimal total_amount,
        String status,
        String payment_transaction_id,
        LocalDateTime expires_at,
        LocalDateTime created_at,
        LocalDateTime updated_at,
        List<AdminBookingItemResponse> items
) {
}
