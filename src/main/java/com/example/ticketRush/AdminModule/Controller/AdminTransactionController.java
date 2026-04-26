package com.example.ticketRush.AdminModule.Controller;

import com.example.ticketRush.AdminModule.Dto.Response.AdminPaymentTransactionResponse;
import com.example.ticketRush.AdminModule.Service.AdminTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/transactions")
public class AdminTransactionController {

    private final AdminTransactionService adminTransactionService;

    @GetMapping
    public List<AdminPaymentTransactionResponse> getTransactions() {
        return adminTransactionService.getTransactions();
    }
}
