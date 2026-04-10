package com.example.ticketRush.UserModule.Dto.Request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body dùng để đăng ký tài khoản mới.
 */
@Schema(description = "Thông tin đăng ký tài khoản mới")
public record RegisterRequest(

        @Schema(
                description = "Địa chỉ email (duy nhất trong hệ thống)",
                example = "user@example.com",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @Schema(
                description = "Mật khẩu (tối thiểu 6 ký tự)",
                example = "Secret123",
                requiredMode = Schema.RequiredMode.REQUIRED,
                minLength = 6,
                format = "password"
        )
        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        String password,

        @Schema(
                description = "Họ và tên đầy đủ",
                example = "Nguyễn Văn A",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "Full name is required")
        String fullName,

        @Schema(
                description = "Số điện thoại (tùy chọn, 10–11 chữ số)",
                example = "0901234567",
                requiredMode = Schema.RequiredMode.NOT_REQUIRED,
                nullable = true
        )
        String phoneNumber

) {}