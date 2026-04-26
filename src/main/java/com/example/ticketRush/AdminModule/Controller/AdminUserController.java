package com.example.ticketRush.AdminModule.Controller;

import com.example.ticketRush.AdminModule.Dto.Response.AdminUserDetailResponse;
import com.example.ticketRush.AdminModule.Dto.Response.AdminUserSummaryResponse;
import com.example.ticketRush.AdminModule.Service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public List<AdminUserSummaryResponse> getUsers() {
        return adminUserService.getUsers();
    }

    @GetMapping("/{userId}")
    public AdminUserDetailResponse getUser(@PathVariable UUID userId) {
        return adminUserService.getUser(userId);
    }
}
