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

    @Override
    public void findOrCreateUserFromKeycloak(String keycloakSubjectId, String username, String email, String fullName, Role role) {
        // Hiện DB chưa có cột keycloakSubjectId, nên mình dùng email/username để "upsert" tối thiểu.
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
}

