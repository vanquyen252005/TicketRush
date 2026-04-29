package com.example.ticketRush.AdminModule.Service;

import com.example.ticketRush.AdminModule.Dto.Response.AdminDashboardResponse;
import com.example.ticketRush.AdminModule.Dto.Response.AdminDashboardTransactionsResponse;

public interface AdminDashboardService {
    AdminDashboardResponse getDashboard();

    AdminDashboardTransactionsResponse getLiveTransactions(int limit);
}
