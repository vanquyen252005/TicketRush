package com.example.ticketRush.UserModule.Dto.Request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * Request body dùng để refresh access token.
 */
@Schema(description = "Thông tin refresh token")
public record RefreshTokenRequest(

        @Schema(
                description = "Refresh token nhận được khi đăng nhập",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "Refresh token không được để trống")
        String refreshToken

) {}
