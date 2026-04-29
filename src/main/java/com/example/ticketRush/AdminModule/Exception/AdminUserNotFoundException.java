package com.example.ticketRush.AdminModule.Exception;

import java.util.UUID;

public class AdminUserNotFoundException extends RuntimeException {

    public AdminUserNotFoundException(UUID userId) {
        super("Không tìm thấy người dùng với id: " + userId);
    }
}
