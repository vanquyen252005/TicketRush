error id: file://<WORKSPACE>/src/main/java/com/example/ticketRush/UserModule/Controller/AuthController.java
file://<WORKSPACE>/src/main/java/com/example/ticketRush/UserModule/Controller/AuthController.java
### com.thoughtworks.qdox.parser.ParseException: syntax error @[63,48]

error in qdox parser
file content:
```java
offset: 2685
uri: file://<WORKSPACE>/src/main/java/com/example/ticketRush/UserModule/Controller/AuthController.java
text:
```scala
package com.example.ticketRush.UserModule.Controller;

import com.example.ticketRush.UserModule.Dto.Request.LoginRequest;
import com.example.ticketRush.UserModule.Dto.Request.RegisterRequest;
import com.example.ticketRush.UserModule.Dto.Response.AuthResponse;
import com.example.ticketRush.UserModule.Service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý xác thực người dùng (đăng ký / đăng nhập / đăng xuất).
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Các API xác thực: đăng ký, đăng nhập, đăng xuất")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // ─── Đăng ký ────────────────────────────────────────────────────────────

    @Operation(
            summary = "Đăng ký tài khoản mới",
            description = """
                    Tạo tài khoản người dùng mới trong hệ thống.
                    
                    **Yêu cầu:**
                    - Email hợp lệ và chưa tồn tại trong hệ thống
                    - Mật khẩu ít nhất 6 ký tự
                    - Họ tên không được để trống
                    
                    **Kết quả:** Trả về JWT access token và thông tin người dùng vừa tạo.
                    """,
            security = @SecurityRequirement(name = "")
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Đăng ký thành công",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = AuthResponse.class),
                            examples = @ExampleObject(
                                    name = "Thành công",
                                    value = """
                                            {
                                              "a@@ccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNjgwMDAwMDAwLCJleHAiOjE2ODAwODY0MDB9...",
                                              "user": {
                                                "id": "550e8400-e29b-41d4-a716-446655440000",
                                                "email": "user@example.com",
                                                "username": null,
                                                "fullName": "Nguyễn Văn A",
                                                "phoneNumber": "0901234567",
                                                "gender": null,
                                                "dateOfBirth": null,
                                                "role": "ROLE_USER",
                                                "status": "ACTIVE",
                                                "createdAt": "2025-04-11T10:00:00",
                                                "updatedAt": "2025-04-11T10:00:00"
                                              }
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dữ liệu đầu vào không hợp lệ",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "timestamp": "2025-04-11T10:00:00",
                                              "status": 400,
                                              "message": "Validation failed",
                                              "errors": {
                                                "email": "Invalid email format",
                                                "password": "Password must be at least 6 characters"
                                              }
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Email đã được đăng ký",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "status": 409,
                                              "message": "Email already in use"
                                            }
                                            """
                            )
                    )
            )
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Thông tin đăng ký tài khoản",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = RegisterRequest.class),
                            examples = @ExampleObject(
                                    name = "Ví dụ đăng ký",
                                    value = """
                                            {
                                              "email": "user@example.com",
                                              "password": "Secret123",
                                              "fullName": "Nguyễn Văn A",
                                              "phoneNumber": "0901234567"
                                            }
                                            """
                            )
                    )
            )
            @RequestBody RegisterRequest request
    ) {
        AuthResponse response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─── Đăng nhập ──────────────────────────────────────────────────────────

    @Operation(
            summary = "Đăng nhập bằng email & mật khẩu",
            description = """
                    Xác thực người dùng và trả về JWT access token.
                    
                    **Sử dụng token:**
                    Sau khi nhận được `accessToken`, đính kèm vào header của các request tiếp theo:
                    ```
                    Authorization: Bearer <accessToken>
                    ```
                    """,
            security = @SecurityRequirement(name = "")
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Đăng nhập thành công",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = AuthResponse.class),
                            examples = @ExampleObject(
                                    name = "Thành công",
                                    value = """
                                            {
                                              "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNjgwMDAwMDAwLCJleHAiOjE2ODAwODY0MDB9...",
                                              "user": {
                                                "id": "550e8400-e29b-41d4-a716-446655440000",
                                                "email": "user@example.com",
                                                "username": "nguyenvana",
                                                "fullName": "Nguyễn Văn A",
                                                "phoneNumber": "0901234567",
                                                "gender": "MALE",
                                                "dateOfBirth": "1990-01-15",
                                                "role": "ROLE_USER",
                                                "status": "ACTIVE",
                                                "createdAt": "2025-04-10T08:00:00",
                                                "updatedAt": "2025-04-11T10:30:00"
                                              }
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Sai email hoặc mật khẩu",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "status": 401,
                                              "message": "Invalid email or password"
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Tài khoản bị vô hiệu hóa",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "status": 403,
                                              "message": "Account is disabled"
                                            }
                                            """
                            )
                    )
            )
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Thông tin đăng nhập",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = LoginRequest.class),
                            examples = @ExampleObject(
                                    name = "Ví dụ đăng nhập",
                                    value = """
                                            {
                                              "email": "user@example.com",
                                              "password": "Secret123"
                                            }
                                            """
                            )
                    )
            )
            @RequestBody LoginRequest request
    ) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    // ─── Lấy thông tin user hiện tại ────────────────────────────────────────

    @Operation(
            summary = "Lấy thông tin user đang đăng nhập",
            description = "Trả về thông tin cơ bản của người dùng hiện đang được xác thực.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Thông tin user hiện tại",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "authenticated": true,
                                              "name": "user@example.com",
                                              "authorities": ["ROLE_USER"],
                                              "details": {
                                                "remoteAddress": "127.0.0.1"
                                              }
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Chưa đăng nhập hoặc token không hợp lệ",
                    content = @Content(
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "status": 401,
                                              "message": "Unauthorized"
                                            }
                                            """
                            )
                    )
            )
    })
    @GetMapping("/me")
    public ResponseEntity<Authentication> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(authentication);
    }
}
                    Xác thực người dùng và trả về JWT access token.
                    
                    **Lưu ý:** Ngoài endpoint này, hệ thống còn hỗ trợ đăng nhập qua **OAuth2/OIDC (Keycloak)**
                    thông qua flow `/oauth2/authorization/ticketRush` (form login tại `/login`).
                    
                    **Sử dụng token:**
                    Sau khi nhận được `accessToken`, đính kèm vào header của các request tiếp theo:
                    ```
                    Authorization: Bearer <accessToken>
                    ```
                    """,
            security = @SecurityRequirement(name = "") // Không cần auth để login
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Đăng nhập thành công",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = AuthResponse.class),
                            examples = @ExampleObject(
                                    name = "Thành công",
                                    value = """
                                            {
                                              "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
                                              "user": {
                                                "id": "550e8400-e29b-41d4-a716-446655440000",
                                                "email": "user@example.com",
                                                "fullName": "Nguyễn Văn A",
                                                "phoneNumber": "0901234567",
                                                "role": "ROLE_USER"
                                              }
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Sai email hoặc mật khẩu",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "status": 401,
                                              "message": "Bad credentials"
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Tài khoản bị khóa hoặc chưa kích hoạt",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "status": 403,
                                              "message": "Account is disabled"
                                            }
                                            """
                            )
                    )
            )
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Thông tin đăng nhập",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = LoginRequest.class),
                            examples = @ExampleObject(
                                    name = "Ví dụ đăng nhập",
                                    value = """
                                            {
                                              "email": "user@example.com",
                                              "password": "Secret123"
                                            }
                                            """
                            )
                    )
            )
            @RequestBody LoginRequest request
    ) {
        // TODO: Thay thế stub bằng: return ResponseEntity.ok(userService.login(request));
        UserResponse stubUser = new UserResponse(
                UUID.randomUUID(),
                request.email(),
                "Nguyễn Văn A",
                "0901234567",
                "ROLE_USER"
        );
        return ResponseEntity.ok(new AuthResponse("stub-jwt-token-replace-with-real-impl", stubUser));
    }

    // ─── Thông tin user hiện tại ─────────────────────────────────────────────

    @Operation(
            summary = "Lấy thông tin user đang đăng nhập",
            description = """
                    Trả về thông tin cơ bản của người dùng hiện đang được xác thực.
                    
                    Endpoint này yêu cầu đính kèm JWT token hợp lệ trong header.
                    """,
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Thông tin user hiện tại",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "authenticated": true,
                                              "name": "user@example.com",
                                              "authorities": ["ROLE_USER"],
                                              "authClass": "org.springframework.security.authentication.UsernamePasswordAuthenticationToken"
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Chưa đăng nhập hoặc token hết hạn"
            )
    })
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
                    Đăng xuất khỏi hệ thống.
                    
                    - Với **form login**: invalidate HTTP session và xóa cookie `JSESSIONID`.
                    - Với **OAuth2/OIDC (Keycloak)**: redirect về Keycloak để logout, sau đó redirect về `/login`.
                    
                    > **Lưu ý:** Endpoint này thường được gọi bằng HTTP POST kèm CSRF token từ form Thymeleaf.
                    > Khi gọi từ Swagger, có thể cần disable CSRF hoặc gửi header `X-CSRF-TOKEN`.
                    """,
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Đăng xuất thành công",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "message": "Logged out successfully"
                                            }
                                            """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Chưa đăng nhập"
            )
    })
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // Spring Security xử lý logout tại /logout (SecurityConfig).
        // Endpoint này chỉ là stub cho Swagger documentation.
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}

```

```



#### Error stacktrace:

```
com.thoughtworks.qdox.parser.impl.Parser.yyerror(Parser.java:2025)
	com.thoughtworks.qdox.parser.impl.Parser.yyparse(Parser.java:2147)
	com.thoughtworks.qdox.parser.impl.Parser.parse(Parser.java:2006)
	com.thoughtworks.qdox.library.SourceLibrary.parse(SourceLibrary.java:232)
	com.thoughtworks.qdox.library.SourceLibrary.parse(SourceLibrary.java:190)
	com.thoughtworks.qdox.library.SourceLibrary.addSource(SourceLibrary.java:94)
	com.thoughtworks.qdox.library.SourceLibrary.addSource(SourceLibrary.java:89)
	com.thoughtworks.qdox.library.SortedClassLibraryBuilder.addSource(SortedClassLibraryBuilder.java:162)
	com.thoughtworks.qdox.JavaProjectBuilder.addSource(JavaProjectBuilder.java:174)
	scala.meta.internal.mtags.JavaMtags.indexRoot(JavaMtags.scala:49)
	scala.meta.internal.metals.SemanticdbDefinition$.foreachWithReturnMtags(SemanticdbDefinition.scala:99)
	scala.meta.internal.metals.Indexer.indexSourceFile(Indexer.scala:560)
	scala.meta.internal.metals.Indexer.$anonfun$reindexWorkspaceSources$3(Indexer.scala:691)
	scala.meta.internal.metals.Indexer.$anonfun$reindexWorkspaceSources$3$adapted(Indexer.scala:688)
	scala.collection.IterableOnceOps.foreach(IterableOnce.scala:630)
	scala.collection.IterableOnceOps.foreach$(IterableOnce.scala:628)
	scala.collection.AbstractIterator.foreach(Iterator.scala:1313)
	scala.meta.internal.metals.Indexer.reindexWorkspaceSources(Indexer.scala:688)
	scala.meta.internal.metals.MetalsLspService.$anonfun$onChange$2(MetalsLspService.scala:940)
	scala.runtime.java8.JFunction0$mcV$sp.apply(JFunction0$mcV$sp.scala:18)
	scala.concurrent.Future$.$anonfun$apply$1(Future.scala:691)
	scala.concurrent.impl.Promise$Transformation.run(Promise.scala:500)
	java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1144)
	java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:642)
	java.base/java.lang.Thread.run(Thread.java:1583)
```
#### Short summary: 

QDox parse error in file://<WORKSPACE>/src/main/java/com/example/ticketRush/UserModule/Controller/AuthController.java