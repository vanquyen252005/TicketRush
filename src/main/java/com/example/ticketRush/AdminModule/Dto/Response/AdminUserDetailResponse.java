package com.example.ticketRush.AdminModule.Dto.Response;

import java.util.List;

public record AdminUserDetailResponse(
        AdminUserSummaryResponse user,
        List<AdminBookingResponse> bookings,
        List<AdminPaymentTransactionResponse> transactions
) {
}
