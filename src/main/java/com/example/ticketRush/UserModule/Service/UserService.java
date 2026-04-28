package com.example.ticketRush.UserModule.Service;

import com.example.ticketRush.UserModule.Entity.User;
import com.example.ticketRush.UserModule.Enum.Role;

import java.util.Optional;

public interface UserService {
    void findOrCreateUserFromKeycloak(String keycloakSubjectId, String username, String email, String fullName, Role role);

    /**
     * Tìm user bằng email hoặc username (case-insensitive).
     */
    Optional<User> findByIdentifier(String identifier);

    /**
     * Lấy danh sách users từ Keycloak và ghi ra file JSON
     */
    void exportUsersToJsonFile(String filePath);

    /**
     * Lấy danh sách users trực tiếp từ Keycloak (không qua file trung gian)
     */
    java.util.List<java.util.Map<String, Object>> getAllKeycloakUsers();

    /**
     * Tạo người dùng mới trong Keycloak
     */
    void createKeycloakUser(String username, String email, String password, String firstName, String lastName, String phoneNumber, String role, String gender, String dob);
    /**
     * Xóa người dùng trong Keycloak theo ID
     */
    void deleteKeycloakUser(String userId);

    /**
     * Cập nhật thông tin người dùng trong Keycloak
     */
    void updateKeycloakUser(String userId, String firstName, String lastName, String email, String phoneNumber, String role, String gender, String dateOfBirth);
}
