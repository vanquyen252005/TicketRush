package com.example.ticketRush.UserModule.Dto.Response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

/**
 * Thông tin cơ bản của người dùng – dùng trong các response API.
 */
@Schema(description = "Thông tin cơ bản của người dùng")
public record UserResponse(

        @Schema(
                description = "UUID của người dùng",
                example = "550e8400-e29b-41d4-a716-446655440000"
        )
        UUID id,

        @Schema(
                description = "Địa chỉ email",
                example = "user@example.com"
        )
        String email,

        @Schema(
                description = "Họ và tên đầy đủ",
                example = "Nguyễn Văn A"
        )
        String fullName,

        @Schema(
                description = "Số điện thoại",
                example = "0901234567",
                nullable = true
        )
        String phoneNumber,

        @Schema(
                description = "Vai trò của người dùng trong hệ thống",
                example = "ROLE_USER",
                allowableValues = {"ROLE_USER", "ROLE_ADMIN"}
        )
        String role

) {}