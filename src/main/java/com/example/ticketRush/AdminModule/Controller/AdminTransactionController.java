package com.example.ticketRush.AdminModule.Controller;

import com.example.ticketRush.AdminModule.Dto.Response.AdminPaymentTransactionResponse;
import com.example.ticketRush.AdminModule.Service.AdminTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/transactions")
public class AdminTransactionController {

    private final AdminTransactionService adminTransactionService;

    @GetMapping
    public List<AdminPaymentTransactionResponse> getTransactions(@RequestParam(required = false) UUID userId) {
        return userId == null ? adminTransactionService.getTransactions() : adminTransactionService.getTransactions(userId);
    }
}
