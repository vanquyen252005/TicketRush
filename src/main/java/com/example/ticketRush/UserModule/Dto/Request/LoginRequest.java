package com.example.ticketRush.UserModule.Dto.Request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * Request body dùng để đăng nhập bằng username/email và mật khẩu.
 */
@Schema(description = "Thông tin đăng nhập")
public record LoginRequest(

        @Schema(
                description = "Email hoặc username đã đăng ký",
                example = "user@example.com",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "Email/Username không được để trống")
        String identifier,

        @Schema(
                description = "Mật khẩu của tài khoản",
                example = "Secret123",
                requiredMode = Schema.RequiredMode.REQUIRED,
                minLength = 6,
                format = "password"
        )
        @NotBlank(message = "Mật khẩu không được để trống")
        String password

) {}