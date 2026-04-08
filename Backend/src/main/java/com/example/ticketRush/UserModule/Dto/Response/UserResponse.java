package com.example.ticketRush.UserModule.Dto.Response;
import java.util.UUID;
public record UserResponse(
        UUID id, String email, String fullName, String phoneNumber, String role
) {}