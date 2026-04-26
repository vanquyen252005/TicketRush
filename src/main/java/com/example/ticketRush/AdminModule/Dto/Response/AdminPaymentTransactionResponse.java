package com.example.ticketRush.AdminModule.Dto.Response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record AdminPaymentTransactionResponse(
        UUID id,
        UUID booking_id,
        Long event_id,
        String event_name,
        UUID user_id,
        String user_full_name,
        String user_email,
        BigDecimal amount,
        String currency,
        String payment_method,
        String status,
        String gateway_transaction_id,
        String reference_txn_id,
        String error_message,
        LocalDateTime created_at,
        LocalDateTime updated_at
) {
}
