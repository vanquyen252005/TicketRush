package com.example.ticketRush.AdminModule.Dto.Response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record AdminUserSummaryResponse(
        UUID id,
        String email,
        String full_name,
        String phone_number,
        String gender,
        LocalDate date_of_birth,
        String role,
        String status,
        LocalDateTime created_at,
        LocalDateTime updated_at,
        long booking_count,
        long ticket_count,
        long transaction_count,
        BigDecimal total_spent,
        LocalDateTime last_activity_at
) {
}
