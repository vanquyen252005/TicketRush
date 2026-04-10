package com.example.ticketRush.UserModule.Dto.Request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * Request body dùng để đăng nhập bằng email và mật khẩu.
 */
@Schema(description = "Thông tin đăng nhập")
public record LoginRequest(

        @Schema(
                description = "Địa chỉ email đã đăng ký",
                example = "user@example.com",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "Email không được để trống")
        String email,

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