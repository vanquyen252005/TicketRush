package com.example.ticketRush.AdminModule.Service;

import com.example.ticketRush.AdminModule.Dto.Response.AdminUserDetailResponse;
import com.example.ticketRush.AdminModule.Dto.Response.AdminUserSummaryResponse;

import java.util.List;
import java.util.UUID;

public interface AdminUserService {
    List<AdminUserSummaryResponse> getUsers();

    AdminUserDetailResponse getUser(UUID userId);
}
