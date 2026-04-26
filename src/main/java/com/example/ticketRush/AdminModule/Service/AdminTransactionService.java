package com.example.ticketRush.AdminModule.Service;

import com.example.ticketRush.AdminModule.Dto.Response.AdminPaymentTransactionResponse;

import java.util.List;

public interface AdminTransactionService {
    List<AdminPaymentTransactionResponse> getTransactions();
}
