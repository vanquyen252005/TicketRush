error id: file://<WORKSPACE>/src/main/java/com/example/ticketRush/UserModule/Controller/AuthController.java:_empty_/AuthResponse#
file://<WORKSPACE>/src/main/java/com/example/ticketRush/UserModule/Controller/AuthController.java
empty definition using pc, found symbol in pc: _empty_/AuthResponse#
semanticdb not found
empty definition using fallback
non-local guesses:

offset: 2763
uri: file://<WORKSPACE>/src/main/java/com/example/ticketRush/UserModule/Controller/AuthController.java
text:
```scala
package com.example.ticketRush.UserModule.Controller;

import com.example.ticketRush.UserModule.Dto.Request.LoginRequest;
import com.example.ticketRush.UserModule.Dto.Request.RefreshTokenRequest;
import com.example.ticketRush.UserModule.Dto.Response.AuthResponse;
import com.example.ticketRush.UserModule.ServiceImpl.KeycloakAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller xử lý xác thực người dùng (đăng nhập / đăng xuất / refresh token).
 * <p>
 * Sử dụng Keycloak làm Identity Provider thông qua ROPC grant (form login)
 * và OAuth2 Authorization Code grant (social login).
 * </p>
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Các API xác thực: đăng nhập, đăng xuất, refresh token")
public class AuthController {

    private final KeycloakAuthService keycloakAuthService;

    public AuthController(KeycloakAuthService keycloakAuthService) {
        this.keycloakAuthService = keycloakAuthService;
    }

    // ─── Đăng nhập ──────────────────────────────────────────────────────────

    @Operation(
            summary = "Đăng nhập bằng username/email + password",
            description = """
                    Xác thực người dùng qua Keycloak (Resource Owner Password Credentials grant).
                    
                    **Identifier** có thể là email hoặc username đã đăng ký trong Keycloak.
                    Trả về JWT access token và refresh token để sử dụng cho các request tiếp theo.
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Đăng nhập thành công",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Email/Username hoặc mật khẩu không chính xác"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dữ liệu đầu vào không hợp lệ"
            )
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthRespons@@e response = keycloakAuthService.loginWithPassword(
                    request.identifier(),
                    request.password()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Refresh Token ──────────────────────────────────────────────────────

    @Operation(
            summary = "Refresh access token",
            description = """
                    Sử dụng refresh token để lấy access token mới khi token cũ hết hạn.
                    Trả về access token mới và refresh token mới (token rotation).
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Refresh thành công",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Refresh token không hợp lệ hoặc đã hết hạn"
            )
    })
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            AuthResponse response = keycloakAuthService.refreshToken(request.refreshToken());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Thông tin user hiện tại ─────────────────────────────────────────────

    @Operation(
            summary = "Lấy thông tin user hiện tại",
            description = "Trả về thông tin của user đang đăng nhập dựa trên JWT token trong header."
    )
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "name", authentication.getName(),
                "authorities", authentication.getAuthorities().stream()
                        .map(a -> a.getAuthority()).toList(),
                "authClass", authentication.getClass().getName()
        ));
    }

    // ─── Đăng xuất ──────────────────────────────────────────────────────────

    @Operation(
            summary = "Đăng xuất",
            description = """
                    Đăng xuất phía client: xoá token khỏi localStorage.
                    Endpoint này chỉ là placeholder cho Swagger documentation.
                    Thực tế, stateless JWT logout xử lý ở phía frontend.
                    """
    )
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}

```


#### Short summary: 

empty definition using pc, found symbol in pc: _empty_/AuthResponse#