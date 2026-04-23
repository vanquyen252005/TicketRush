package com.example.ticketRush.UserModule.Controller;

import com.example.ticketRush.UserModule.Dto.Response.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Controller quản lý tài khoản người dùng.
 *
 * <p>Tất cả endpoint đều yêu cầu xác thực (JWT Bearer Token).</p>
 */
@RestController
@RequestMapping("/api/users")
@Tag(name = "User", description = "Các API quản lý tài khoản người dùng")
@SecurityRequirement(name = "bearerAuth") // Áp dụng bearerAuth cho tất cả endpoint trong controller này
public class UserController {

    // ─── Lấy profile ────────────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(
            @Parameter(hidden = true) Authentication authentication
    ) {
        // TODO: Thay thế stub bằng: return ResponseEntity.ok(userService.getProfile(authentication.getName()));
        UserResponse stubResponse = new UserResponse(
                UUID.fromString("550e8400-e29b-41d4-a716-446655440000"),
                authentication != null ? authentication.getName() : "user@example.com",
                "Nguyễn Văn A",
                "0901234567",
                "ROLE_USER"
        );
        return ResponseEntity.ok(stubResponse);
    }

    // ─── Cập nhật profile ───────────────────────────────────────────────────

    @Operation(
            summary = "Cập nhật hồ sơ cá nhân",
            description = """
                    Cập nhật thông tin hồ sơ của người dùng **đang đăng nhập**.
                    
                    **Các trường có thể cập nhật:**
                    - `fullName` – Họ và tên đầy đủ
                    - `phoneNumber` – Số điện thoại (10-11 chữ số)
                    - `gender` – Giới tính
                    - `dateOfBirth` – Ngày sinh (định dạng `YYYY-MM-DD`)
                    
                    > Email và role **không thể** thay đổi qua endpoint này.
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Cập nhật thành công",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = UserResponse.class),
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "id": "550e8400-e29b-41d4-a716-446655440000",
                                              "email": "user@example.com",
                                              "fullName": "Nguyễn Văn B (đã cập nhật)",
                                              "phoneNumber": "0987654321",
                                              "role": "ROLE_USER"
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dữ liệu đầu vào không hợp lệ"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Chưa đăng nhập hoặc token hết hạn"
            )
    })
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Thông tin cần cập nhật (chỉ gửi các trường muốn thay đổi)",
                    required = true,
                    content = @Content(
                            examples = @ExampleObject(
                                    name = "Ví dụ cập nhật",
                                    value = """
                                            {
                                              "fullName": "Nguyễn Văn B",
                                              "phoneNumber": "0987654321",
                                              "gender": "Nam",
                                              "dateOfBirth": "1999-05-15"
                                            }
                                            """
                            )
                    )
            )
            @RequestBody Map<String, Object> updateRequest,
            @Parameter(hidden = true) Authentication authentication
    ) {
        // TODO: Thay thế stub bằng: return ResponseEntity.ok(userService.updateProfile(authentication.getName(), updateRequest));
        UserResponse stubResponse = new UserResponse(
                UUID.fromString("550e8400-e29b-41d4-a716-446655440000"),
                authentication != null ? authentication.getName() : "user@example.com",
                (String) updateRequest.getOrDefault("fullName", "Nguyễn Văn A"),
                (String) updateRequest.getOrDefault("phoneNumber", "0901234567"),
                "ROLE_USER"
        );
        return ResponseEntity.ok(stubResponse);
    }
}
