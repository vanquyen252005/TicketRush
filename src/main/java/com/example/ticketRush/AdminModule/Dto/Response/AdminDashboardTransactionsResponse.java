package com.example.ticketRush.AdminModule.Dto.Response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AdminDashboardTransactionsResponse(
        TransactionSummary summary,
        List<AdminPaymentTransactionResponse> recent_transactions,
        LocalDateTime generated_at
) {
    public record TransactionSummary(
            long total_transactions,
            long successful_transactions,
            long pending_transactions,
            long failed_transactions,
            BigDecimal successful_amount,
            LocalDateTime latest_transaction_at
    ) {
    }
}
