package com.example.ticketRush.AdminModule.Controller;

import com.example.ticketRush.AdminModule.Dto.Response.AdminDashboardResponse;
import com.example.ticketRush.AdminModule.Dto.Response.AdminDashboardTransactionsResponse;
import com.example.ticketRush.AdminModule.Service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping
    public AdminDashboardResponse getDashboard() {
        return adminDashboardService.getDashboard();
    }

    @GetMapping("/transactions/live")
    public AdminDashboardTransactionsResponse getLiveTransactions(@RequestParam(defaultValue = "8") int limit) {
        return adminDashboardService.getLiveTransactions(limit);
    }
}
