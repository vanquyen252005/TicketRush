package com.example.ticketRush.UserModule.Controller;

import com.example.ticketRush.UserModule.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<java.util.List<java.util.Map<String, Object>>> getAllUsers() {
        // Trả về danh sách user trực tiếp từ Keycloak dưới dạng JSON
        return ResponseEntity.ok(userService.getAllKeycloakUsers());
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportUsers() {
        try {
            // Vẫn giữ lại tính năng export nếu cần backup thủ công
            String filePath = "FE/src/app/data/mock-users.json";
            userService.exportUsersToJsonFile(filePath);
            return ResponseEntity.ok("Successfully exported users to " + filePath);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to export users: " + e.getMessage());
        }
    }
}
