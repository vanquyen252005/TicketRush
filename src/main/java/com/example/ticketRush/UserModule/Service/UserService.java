package com.example.ticketRush.UserModule.Service;

import com.example.ticketRush.UserModule.Enum.Role;

public interface UserService {
    void findOrCreateUserFromKeycloak(String keycloakSubjectId, String username, String email, String fullName, Role role);
}
