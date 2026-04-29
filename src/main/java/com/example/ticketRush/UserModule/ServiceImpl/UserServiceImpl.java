package com.example.ticketRush.UserModule.ServiceImpl;

import com.example.ticketRush.UserModule.Entity.User;
import com.example.ticketRush.UserModule.Enum.Role;
import com.example.ticketRush.UserModule.Enum.UserStatus;
import com.example.ticketRush.UserModule.Repository.UserRepository;
import com.example.ticketRush.UserModule.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);
    private static final List<DateTimeFormatter> DATE_FORMATTERS = List.of(
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ofPattern("M/d/uuuu"),
            DateTimeFormatter.ofPattern("d/M/uuuu"),
            DateTimeFormatter.ofPattern("uuuu/M/d")
    );

    private final UserRepository userRepository;
    private final org.keycloak.admin.client.Keycloak keycloak;

    @org.springframework.beans.factory.annotation.Value("${keycloak.admin.realm}")
    private String realm;

    @Override
    public void findOrCreateUserFromKeycloak(String keycloakSubjectId, String username, String email, String fullName,
            Role role) {
        String gender = null;
        String dateOfBirth = null;

        if (hasMeaningfulText(keycloakSubjectId)) {
            try {
                org.keycloak.representations.idm.UserRepresentation keycloakUser = keycloak.realm(realm).users()
                        .get(keycloakSubjectId)
                        .toRepresentation();
                gender = extractMeaningfulAttribute(keycloakUser, "gender");
                dateOfBirth = extractMeaningfulAttribute(keycloakUser,
                        "dateOfBirth",
                        "date_of_birth",
                        "date-of-birth",
                        "date_of_bird",
                        "dob");
            } catch (jakarta.ws.rs.NotFoundException e) {
                log.warn("Không tìm thấy user Keycloak với subjectId {} khi đồng bộ hồ sơ local", keycloakSubjectId);
            } catch (Exception e) {
                log.warn("Không thể đọc hồ sơ Keycloak cho subjectId {}: {}", keycloakSubjectId, e.getMessage());
            }
        }

        upsertLocalUserProfile(username, email, fullName, role, gender, parseDateOfBirth(dateOfBirth));
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
                userMap.put("username", user.getUsername());

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
                String gender = "N/A";
                String dateOfBirth = "N/A";
                if (user.getAttributes() != null) {
                    if (user.getAttributes().containsKey("PhoneNumber")) {
                        java.util.List<String> phones = user.getAttributes().get("PhoneNumber");
                        if (phones != null && !phones.isEmpty())
                            phoneNumber = phones.get(0);
                    }
                    if (user.getAttributes().containsKey("gender")) {
                        java.util.List<String> genders = user.getAttributes().get("gender");
                        if (genders != null && !genders.isEmpty())
                            gender = genders.get(0);
                    }
                    // Thử nhiều key khác nhau cho ngày sinh phòng trường hợp gõ sai trên Keycloak
                    String[] dobKeys = {"dateOfBirth", "date_of_birth", "date-of_bird", "date-of-birth", "dob"};
                    for (String key : dobKeys) {
                        if (user.getAttributes().containsKey(key)) {
                            java.util.List<String> dobs = user.getAttributes().get(key);
                            if (dobs != null && !dobs.isEmpty()) {
                                dateOfBirth = dobs.get(0);
                                break;
                            }
                        }
                    }
                }
                userMap.put("phone_number", phoneNumber);
                userMap.put("gender", gender);
                userMap.put("date_of_birth", dateOfBirth);
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

    @Override
    public void createKeycloakUser(String username, String email, String password, String firstName, String lastName,
            String phoneNumber, String role, String gender, String dob) {
        try {
            org.keycloak.representations.idm.UserRepresentation user = new org.keycloak.representations.idm.UserRepresentation();
            user.setUsername(username);
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEnabled(true);
            user.setEmailVerified(true);

            java.util.Map<String, java.util.List<String>> attributes = new java.util.HashMap<>();
            if (phoneNumber != null && !phoneNumber.isBlank()) {
                attributes.put("PhoneNumber", java.util.List.of(phoneNumber));
            }

            String normalizedGender = normalizeGenderForStorage(gender);
            if (normalizedGender != null) {
                attributes.put("gender", java.util.List.of(normalizedGender));
            }

            LocalDate parsedDob = parseDateOfBirth(dob);
            if (parsedDob != null) {
                String normalizedDob = parsedDob.format(DateTimeFormatter.ISO_LOCAL_DATE);
                attributes.put("dateOfBirth", java.util.List.of(normalizedDob));
                attributes.put("date_of_birth", java.util.List.of(normalizedDob));
                attributes.put("date-of-birth", java.util.List.of(normalizedDob));
                attributes.put("date_of_bird", java.util.List.of(normalizedDob));
                attributes.put("dob", java.util.List.of(normalizedDob));
            }
            if (!attributes.isEmpty()) {
                user.setAttributes(attributes);
            }

            // Set password
            org.keycloak.representations.idm.CredentialRepresentation credential = new org.keycloak.representations.idm.CredentialRepresentation();
            credential.setType(org.keycloak.representations.idm.CredentialRepresentation.PASSWORD);
            credential.setValue(password);
            credential.setTemporary(false);
            user.setCredentials(java.util.List.of(credential));

            // Create user in Keycloak
            jakarta.ws.rs.core.Response response = keycloak.realm(realm).users().create(user);

            if (response.getStatus() == 201) {
                // Extract created user ID from Location header
                String locationHeader = response.getHeaderString("Location");
                String userId = locationHeader.substring(locationHeader.lastIndexOf("/") + 1);

                // Assign role if specified
                if (role != null && !role.isBlank() && !"CUSTOMER".equalsIgnoreCase(role)) {
                    try {
                        org.keycloak.representations.idm.RoleRepresentation roleRep = keycloak.realm(realm).roles()
                                .get(role).toRepresentation();
                        keycloak.realm(realm).users().get(userId).roles().realmLevel().add(java.util.List.of(roleRep));
                    } catch (Exception e) {
                        System.err.println("Warning: Could not assign role '" + role + "' to user: " + e.getMessage());
                    }
                }

                try {
                    upsertLocalUserProfile(username, email, buildFullName(firstName, lastName),
                            resolveLocalRole(role), normalizedGender, parsedDob);
                } catch (Exception e) {
                    log.warn("Không thể đồng bộ user mới về DB local (email={}): {}", email, e.getMessage());
                }
            } else if (response.getStatus() == 409) {
                throw new RuntimeException("Người dùng với email hoặc username này đã tồn tại");
            } else {
                throw new RuntimeException("Không thể tạo người dùng. Keycloak trả về status: " + response.getStatus());
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo người dùng trong Keycloak: " + e.getMessage());
        }
    }

    @Override
    public void deleteKeycloakUser(String userId) {
        try {
            jakarta.ws.rs.core.Response response = keycloak.realm(realm).users().delete(userId);
            if (response.getStatus() != 204 && response.getStatus() != 200) {
                throw new RuntimeException("Không thể xóa người dùng. Keycloak trả về status: " + response.getStatus());
            }
        } catch (jakarta.ws.rs.NotFoundException e) {
            throw new RuntimeException("Không tìm thấy người dùng với ID này");
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa người dùng: " + e.getMessage());
        }
    }

    @Override
    public void updateKeycloakUser(String userId, String firstName, String lastName, String email, String phoneNumber,
            String role, String gender, String dob) {
        try {
            org.keycloak.admin.client.resource.UserResource userResource = keycloak.realm(realm).users().get(userId);
            org.keycloak.representations.idm.UserRepresentation user = userResource.toRepresentation();
            String username = user.getUsername();

            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);

            // Cập nhật attributes
            java.util.Map<String, java.util.List<String>> attributes = user.getAttributes();
            if (attributes == null) {
                attributes = new java.util.HashMap<>();
            } else {
                attributes = new java.util.HashMap<>(attributes);
            }
            if (phoneNumber != null && !phoneNumber.isBlank()) {
                attributes.put("PhoneNumber", java.util.List.of(phoneNumber));
            }

            String normalizedGender = normalizeGenderForStorage(gender);
            if (normalizedGender != null) {
                attributes.put("gender", java.util.List.of(normalizedGender));
            }

            LocalDate parsedDob = parseDateOfBirth(dob);
            if (parsedDob != null) {
                String normalizedDob = parsedDob.format(DateTimeFormatter.ISO_LOCAL_DATE);
                attributes.put("dateOfBirth", java.util.List.of(normalizedDob));
                attributes.put("date_of_birth", java.util.List.of(normalizedDob));
                attributes.put("date-of-birth", java.util.List.of(normalizedDob));
                attributes.put("date_of_bird", java.util.List.of(normalizedDob));
                attributes.put("dob", java.util.List.of(normalizedDob));
            }

            user.setAttributes(attributes);
            userResource.update(user);

            // Cập nhật Role
            if (role != null && !role.isBlank()) {
                // Xóa các role hiện tại (chỉ quản lý các role chính như ADMIN, CUSTOMER,
                // ORGANIZER)
                java.util.List<org.keycloak.representations.idm.RoleRepresentation> currentRoles = userResource.roles()
                        .realmLevel().listAll();
                java.util.List<org.keycloak.representations.idm.RoleRepresentation> rolesToRemove = currentRoles
                        .stream()
                        .filter(r -> r.getName().equals("ADMIN") || r.getName().equals("CUSTOMER")
                                || r.getName().equals("ORGANIZER") || r.getName().equals("ROLE_ADMIN"))
                        .toList();

                if (!rolesToRemove.isEmpty()) {
                    userResource.roles().realmLevel().remove(rolesToRemove);
                }

                // Gán role mới
                org.keycloak.representations.idm.RoleRepresentation newRole = keycloak.realm(realm).roles().get(role)
                        .toRepresentation();
                userResource.roles().realmLevel().add(java.util.List.of(newRole));
            }

            try {
                upsertLocalUserProfile(username, email, buildFullName(firstName, lastName),
                        hasMeaningfulText(role) ? resolveLocalRole(role) : null, normalizedGender, parsedDob);
            } catch (Exception e) {
                log.warn("Không thể đồng bộ cập nhật user về DB local (email={}): {}", email, e.getMessage());
            }
        } catch (jakarta.ws.rs.NotFoundException e) {
            throw new RuntimeException("Không tìm thấy người dùng với ID này");
        } catch (jakarta.ws.rs.WebApplicationException e) {
            String errorMsg = e.getMessage();
            try {
                errorMsg = e.getResponse().readEntity(String.class);
            } catch (Exception ex) {
            }
            throw new RuntimeException("Lỗi từ Keycloak: " + errorMsg);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi cập nhật người dùng trong Keycloak: " + e.getMessage());
        }
    }

    private void upsertLocalUserProfile(String username, String email, String fullName, Role role, String gender,
            LocalDate dateOfBirth) {
        String normalizedEmail = trimToNull(email);
        String normalizedUsername = trimToNull(username);
        if (normalizedEmail == null && normalizedUsername == null) {
            return;
        }

        Optional<User> existingUser = findLocalUser(normalizedEmail, normalizedUsername);
        String providedFullName = trimToNull(fullName);
        String fallbackFullName = firstMeaningfulText(normalizedEmail, normalizedUsername);
        User user = existingUser.orElseGet(() -> User.builder()
                .email(normalizedEmail != null ? normalizedEmail : normalizedUsername)
                .username(normalizedUsername)
                .password(null)
                .fullName(providedFullName != null ? providedFullName : fallbackFullName)
                .role(role == null ? Role.ROLE_USER : role)
                .status(UserStatus.ACTIVE)
                .build());

        boolean changed = existingUser.isEmpty();

        if (normalizedEmail != null && (user.getEmail() == null || !normalizedEmail.equalsIgnoreCase(user.getEmail()))) {
            user.setEmail(normalizedEmail);
            changed = true;
        }

        if (normalizedUsername != null && !normalizedUsername.equals(user.getUsername())) {
            user.setUsername(normalizedUsername);
            changed = true;
        }

        String resolvedFullName = providedFullName;
        if (resolvedFullName == null && existingUser.isEmpty()) {
            resolvedFullName = fallbackFullName;
        }
        if (resolvedFullName != null && !resolvedFullName.equals(user.getFullName())) {
            user.setFullName(resolvedFullName);
            changed = true;
        }

        Role resolvedRole = role != null ? role : (user.getRole() == null ? Role.ROLE_USER : user.getRole());
        if (user.getRole() != resolvedRole) {
            user.setRole(resolvedRole);
            changed = true;
        }

        String normalizedGender = normalizeGenderForStorage(gender);
        if (normalizedGender != null && !normalizedGender.equals(user.getGender())) {
            user.setGender(normalizedGender);
            changed = true;
        }

        if (dateOfBirth != null && !dateOfBirth.equals(user.getDateOfBirth())) {
            user.setDateOfBirth(dateOfBirth);
            changed = true;
        }

        if (user.getStatus() == null) {
            user.setStatus(UserStatus.ACTIVE);
            changed = true;
        }

        if (changed) {
            userRepository.save(user);
        }
    }

    private Optional<User> findLocalUser(String email, String username) {
        if (hasMeaningfulText(email) && hasMeaningfulText(username)) {
            return userRepository.findByEmailIgnoreCaseOrUsernameIgnoreCase(email, username);
        }

        if (hasMeaningfulText(email)) {
            return userRepository.findByEmailIgnoreCase(email);
        }

        if (hasMeaningfulText(username)) {
            return userRepository.findByUsernameIgnoreCase(username);
        }

        return Optional.empty();
    }

    private String extractMeaningfulAttribute(org.keycloak.representations.idm.UserRepresentation user, String... keys) {
        if (user == null || user.getAttributes() == null) {
            return null;
        }

        for (String key : keys) {
            java.util.List<String> values = user.getAttributes().get(key);
            if (values == null || values.isEmpty()) {
                continue;
            }

            for (String value : values) {
                if (hasMeaningfulText(value)) {
                    return value.trim();
                }
            }
        }

        return null;
    }

    private Role resolveLocalRole(String role) {
        if (!hasMeaningfulText(role)) {
            return Role.ROLE_USER;
        }

        String normalized = normalizeComparableText(role);
        return ("admin".equals(normalized) || "role_admin".equals(normalized)) ? Role.ROLE_ADMIN : Role.ROLE_USER;
    }

    private String buildFullName(String firstName, String lastName) {
        String normalizedFirstName = trimToNull(firstName);
        String normalizedLastName = trimToNull(lastName);

        if (normalizedFirstName == null && normalizedLastName == null) {
            return null;
        }

        if (normalizedFirstName == null) {
            return normalizedLastName;
        }

        if (normalizedLastName == null) {
            return normalizedFirstName;
        }

        return (normalizedFirstName + " " + normalizedLastName).trim();
    }

    private String firstMeaningfulText(String... values) {
        for (String value : values) {
            if (hasMeaningfulText(value)) {
                return value.trim();
            }
        }

        return null;
    }

    private LocalDate parseDateOfBirth(String value) {
        if (!hasMeaningfulText(value)) {
            return null;
        }

        String trimmed = value.trim();
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(trimmed, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }

        return null;
    }

    private String normalizeGenderForStorage(String gender) {
        if (!hasMeaningfulText(gender)) {
            return null;
        }

        String normalized = normalizeComparableText(gender);
        return switch (normalized) {
            case "male", "m", "nam" -> "MALE";
            case "female", "f", "nu" -> "FEMALE";
            case "other", "khac" -> "OTHER";
            default -> gender.trim();
        };
    }

    private String normalizeComparableText(String value) {
        if (value == null) {
            return "";
        }

        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "").trim().toLowerCase(Locale.ROOT);
    }

    private boolean hasMeaningfulText(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }

        String normalized = normalizeComparableText(value);
        return !normalized.equals("n/a")
                && !normalized.equals("na")
                && !normalized.equals("null")
                && !normalized.equals("unknown")
                && !normalized.equals("none")
                && !normalized.equals("-")
                && !normalized.equals("chua cap nhat");
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
