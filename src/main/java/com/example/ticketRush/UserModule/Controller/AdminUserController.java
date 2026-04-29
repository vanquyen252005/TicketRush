package com.example.ticketRush.UserModule.Controller;

import com.example.ticketRush.UserModule.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<java.util.List<java.util.Map<String, Object>>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllKeycloakUsers());
    }

    @PostMapping
    public ResponseEntity<java.util.Map<String, Object>> createUser(@RequestBody java.util.Map<String, String> request) {
        try {
            String username = request.get("username");
            String email = request.get("email");
            String password = request.get("password");
            String firstName = request.get("firstName");
            String lastName = request.get("lastName");
            String phoneNumber = request.get("phoneNumber");
            String role = request.getOrDefault("role", "CUSTOMER");
            String gender = request.get("gender");
            String dob = request.get("dateOfBirth");

            if (username == null || username.isBlank()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Username không được để trống"));
            }
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Email không được để trống"));
            }
            if (password == null || password.length() < 6) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Mật khẩu phải có ít nhất 6 ký tự"));
            }

            userService.createKeycloakUser(username, email, password, firstName, lastName, phoneNumber, role, gender, dob);
            return ResponseEntity.status(HttpStatus.CREATED).body(java.util.Map.of("message", "Tạo người dùng thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportUsers() {
        try {
            String filePath = "FE/src/app/data/mock-users.json";
            userService.exportUsersToJsonFile(filePath);
            return ResponseEntity.ok("Successfully exported users to " + filePath);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to export users: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<java.util.Map<String, Object>> updateUser(@PathVariable String id, @RequestBody java.util.Map<String, String> request) {
        try {
            String firstName = request.get("firstName");
            String lastName = request.get("lastName");
            String email = request.get("email");
            String phoneNumber = request.get("phoneNumber");
            String role = request.get("role");
            String gender = request.get("gender");
            String dob = request.get("dateOfBirth");

            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Email không được để trống"));
            }

            userService.updateKeycloakUser(id, firstName, lastName, email, phoneNumber, role, gender, dob);
            return ResponseEntity.ok(java.util.Map.of("message", "Cập nhật người dùng thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<java.util.Map<String, String>> deleteUser(@PathVariable String id) {
        try {
            userService.deleteKeycloakUser(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Xóa người dùng thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }
}
