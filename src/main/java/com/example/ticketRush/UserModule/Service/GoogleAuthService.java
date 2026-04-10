package com.example.ticketRush.UserModule.Service;

import com.example.ticketRush.UserModule.Entity.User;
import com.example.ticketRush.UserModule.Enum.Role;
import com.example.ticketRush.UserModule.Enum.UserStatus;
import com.example.ticketRush.UserModule.Repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserRepository userRepository;

    @Value("${google.client.id:your_google_client_id}")
    private String clientId;

    public User verifyGoogleToken(String idTokenString) throws Exception {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken != null) {
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            return userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        User newUser = User.builder()
                                .email(email)
                                .fullName(name)
                                .password(UUID.randomUUID().toString()) // Random password for OAuth users
                                .role(Role.ROLE_USER)
                                .status(UserStatus.ACTIVE)
                                .build();
                        return userRepository.save(newUser);
                    });
        } else {
            throw new RuntimeException("Invalid Google ID Token");
        }
    }
}
