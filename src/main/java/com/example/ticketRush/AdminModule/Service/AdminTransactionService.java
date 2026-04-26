package com.example.ticketRush.AdminModule.Service;

import com.example.ticketRush.AdminModule.Dto.Response.AdminPaymentTransactionResponse;

import java.util.List;
import java.util.UUID;

public interface AdminTransactionService {
    List<AdminPaymentTransactionResponse> getTransactions();

    List<AdminPaymentTransactionResponse> getTransactions(UUID userId);
}
