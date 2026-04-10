package com.example.ticketRush.UserModule.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller debug để kiểm tra trạng thái xác thực của request hiện tại.
 *
 * <p><b>⚠️ Chỉ dùng trong môi trường Development.</b> Nên vô hiệu hóa hoặc giới hạn quyền
 * trước khi deploy lên Production.</p>
 */
@RestController
@Tag(name = "Debug", description = "Các API hỗ trợ debug / kiểm tra authentication (chỉ dùng trong development)")
public class AuthDebugController {

    @Operation(
            summary = "Kiểm tra trạng thái xác thực",
            description = """
                    Trả về thông tin chi tiết về authentication object của request hiện tại.
                    
                    **Mục đích:** Debug và kiểm tra xem Spring Security đang nhận diện người dùng
                    như thế nào sau khi đăng nhập (form login hoặc OAuth2/OIDC).
                    
                    **Thông tin trả về:**
                    - `authenticated` – Người dùng đã xác thực chưa
                    - `name` – Principal name (email hoặc sub của Keycloak)
                    - `authorities` – Danh sách roles / authorities
                    - `authClass` – Loại Authentication đang được sử dụng
                    
                    > ⚠️ **Lưu ý:** Endpoint này trả về thông tin ngay cả khi chưa đăng nhập
                    > (trong trường hợp đó, `authenticated = false`).
                    """,
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Thông tin authentication hiện tại",
                    content = @Content(
                            examples = {
                                    @ExampleObject(
                                            name = "Đã đăng nhập (OAuth2/OIDC)",
                                            summary = "User đăng nhập qua Keycloak",
                                            value = """
                                                    {
                                                      "authenticated": true,
                                                      "name": "abc-uuid-from-keycloak",
                                                      "authorities": ["ROLE_USER"],
                                                      "authClass": "org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken"
                                                    }
                                                    """
                                    ),
                                    @ExampleObject(
                                            name = "Đã đăng nhập (Form login)",
                                            summary = "User đăng nhập bằng email/password",
                                            value = """
                                                    {
                                                      "authenticated": true,
                                                      "name": "user@example.com",
                                                      "authorities": ["ROLE_USER"],
                                                      "authClass": "org.springframework.security.authentication.UsernamePasswordAuthenticationToken"
                                                    }
                                                    """
                                    ),
                                    @ExampleObject(
                                            name = "Chưa đăng nhập",
                                            summary = "Anonymous user",
                                            value = """
                                                    {
                                                      "authenticated": false,
                                                      "name": null,
                                                      "authorities": [],
                                                      "authClass": null
                                                    }
                                                    """
                                    )
                            }
                    )
            )
    })
    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("authenticated", authentication != null && authentication.isAuthenticated());
        out.put("name", authentication == null ? null : authentication.getName());
        out.put("authorities", authentication == null ? List.of() :
                authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList());
        out.put("authClass", authentication == null ? null : authentication.getClass().getName());
        return out;
    }
}
