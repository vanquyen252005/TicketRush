package com.example.ticketRush.PaymentModule.Dto.Response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentTransactionResponse(
        UUID id,
        UUID booking_id,
        UUID user_id,
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
