package com.example.ticketRush.UserModule.Dto.Response;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response trả về sau khi đăng ký hoặc đăng nhập thành công.
 */
@Schema(description = "Kết quả xác thực – chứa JWT token và thông tin người dùng")
public record AuthResponse(

        @Schema(
                description = "JWT access token dùng để xác thực các request tiếp theo. "
                        + "Đính kèm vào header: Authorization: Bearer <accessToken>",
                example = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
        )
        String accessToken,

        @Schema(
                description = "Refresh token dùng để lấy access token mới khi hết hạn",
                example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        )
        String refreshToken,

        @Schema(description = "Thông tin cơ bản của người dùng vừa xác thực")
        UserResponse user

) {}