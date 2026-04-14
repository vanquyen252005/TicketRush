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
}
