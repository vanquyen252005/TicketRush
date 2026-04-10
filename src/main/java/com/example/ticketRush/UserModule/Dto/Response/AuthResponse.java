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
                example = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIn0..."
        )
        String accessToken,

        @Schema(description = "Thông tin cơ bản của người dùng vừa xác thực")
        UserResponse user

) {}