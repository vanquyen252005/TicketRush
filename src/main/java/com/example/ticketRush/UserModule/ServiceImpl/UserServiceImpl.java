package com.example.ticketRush.UserModule.ServiceImpl;

import com.example.ticketRush.UserModule.Entity.User;
import com.example.ticketRush.UserModule.Enum.Role;
import com.example.ticketRush.UserModule.Enum.UserStatus;
import com.example.ticketRush.UserModule.Repository.UserRepository;
import com.example.ticketRush.UserModule.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final org.keycloak.admin.client.Keycloak keycloak;

    @org.springframework.beans.factory.annotation.Value("${keycloak.admin.realm}")
    private String realm;

    @Override
    public void findOrCreateUserFromKeycloak(String keycloakSubjectId, String username, String email, String fullName,
            Role role) {
        // Hiện DB chưa có cột keycloakSubjectId, nên mình dùng email/username để
        // "upsert" tối thiểu.
        userRepository.findByEmailIgnoreCase(email).ifPresentOrElse(existing -> {
            boolean changed = false;
            if (existing.getUsername() == null && username != null && !username.isBlank()) {
                existing.setUsername(username);
                changed = true;
            }
            if (fullName != null && !fullName.isBlank() && !fullName.equals(existing.getFullName())) {
                existing.setFullName(fullName);
                changed = true;
            }
            if (role != null && role != existing.getRole()) {
                existing.setRole(role);
                changed = true;
            }
            if (existing.getStatus() == null) {
                existing.setStatus(UserStatus.ACTIVE);
                changed = true;
            }
            if (changed) {
                userRepository.save(existing);
            }
        }, () -> {
            User user = User.builder()
                    .email(email)
                    .username(username)
                    .password(null) // user OAuth2 không dùng password nội bộ
                    .fullName((fullName == null || fullName.isBlank()) ? email : fullName)
                    .role(role == null ? Role.ROLE_USER : role)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(user);
        });
    }

    @Override
    public Optional<User> findByIdentifier(String identifier) {
        return userRepository.findByEmailIgnoreCaseOrUsernameIgnoreCase(identifier, identifier);
    }

    @Override
    public java.util.List<java.util.Map<String, Object>> getAllKeycloakUsers() {
        try {
            // 1. Lấy danh sách users từ Keycloak Realm
            java.util.List<org.keycloak.representations.idm.UserRepresentation> users = keycloak.realm(realm).users()
                    .list();

            java.util.List<java.util.Map<String, Object>> userList = new java.util.ArrayList<>();

            // 2. Duyệt qua từng user để lấy thêm thông tin Role
            for (org.keycloak.representations.idm.UserRepresentation user : users) {
                // Lấy các role gán trực tiếp cho user này
                java.util.List<org.keycloak.representations.idm.RoleRepresentation> roles = keycloak.realm(realm)
                        .users().get(user.getId()).roles().realmLevel().listAll();

                java.util.Map<String, Object> userMap = new java.util.HashMap<>();
                userMap.put("id", user.getId());
                // Kết hợp FirstName và LastName
                String fullName = (user.getFirstName() != null ? user.getFirstName() : "") + " "
                        + (user.getLastName() != null ? user.getLastName() : "");
                userMap.put("full_name", fullName.trim().isEmpty() ? user.getUsername() : fullName.trim());
                userMap.put("email", user.getEmail());

                java.util.List<String> roleNames = roles.stream()
                        .map(org.keycloak.representations.idm.RoleRepresentation::getName)
                        .toList();

                // Logic phân quyền: Ưu tiên ADMIN, mặc định là CUSTOMER
                String mainRole = "CUSTOMER";
                if (roleNames.contains("ADMIN") || roleNames.contains("admin")) {
                    mainRole = "ADMIN";
                } else if (roleNames.contains("ORGANIZER")) {
                    mainRole = "ORGANIZER";
                }

                userMap.put("role", mainRole);
                // Avatar mặc định từ Dicebear theo username
                userMap.put("avatar", "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.getUsername());
                String phoneNumber = "N/A";
                if (user.getAttributes() != null && user.getAttributes().containsKey("PhoneNumber")) {
                    java.util.List<String> phones = user.getAttributes().get("PhoneNumber");
                    if (phones != null && !phones.isEmpty()) {
                        phoneNumber = phones.get(0);
                    }
                }
                userMap.put("phone_number", phoneNumber);
                userMap.put("auth_provider", "KEYCLOAK");
                userMap.put("status", Boolean.TRUE.equals(user.isEnabled()) ? "ACTIVE" : "INACTIVE");
                // Lưu thời gian tạo user
                userMap.put("created_at",
                        user.getCreatedTimestamp() != null
                                ? new java.util.Date(user.getCreatedTimestamp()).toInstant().toString()
                                : new java.util.Date().toInstant().toString());

                userList.add(userMap);
            }
            return userList;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi lấy danh sách user từ Keycloak: " + e.getMessage());
        }
    }

    @Override
    public void exportUsersToJsonFile(String filePath) {
        try {
            // Sử dụng hàm vừa viết để lấy dữ liệu
            java.util.List<java.util.Map<String, Object>> userList = getAllKeycloakUsers();

            // Ghi dữ liệu ra file JSON phục vụ cho mục đích backup/mock
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.enable(com.fasterxml.jackson.databind.SerializationFeature.INDENT_OUTPUT);

            java.io.File file = new java.io.File(filePath);
            if (file.getParentFile() != null && !file.getParentFile().exists()) {
                file.getParentFile().mkdirs();
            }
            mapper.writeValue(file, userList);
            System.out.println("Đã export danh sách user ra file: " + file.getAbsolutePath());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi export users ra JSON: " + e.getMessage());
        }
    }
}
