package com.example.ticketRush.UserModule.Controller;

import com.example.ticketRush.UserModule.Dto.JwtResponse;
import com.example.ticketRush.UserModule.Dto.LoginRequest;
import com.example.ticketRush.UserModule.Dto.UserRegisterRequest;
import com.example.ticketRush.UserModule.Entity.User;
import com.example.ticketRush.UserModule.Service.GoogleAuthService;
import com.example.ticketRush.UserModule.Service.UserService;
import com.example.ticketRush.config.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final GoogleAuthService googleAuthService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegisterRequest request) {
        try {
            userService.registerUser(request);
            return ResponseEntity.ok(Map.of("message", "User registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = (User) authentication.getPrincipal();
            String jwt = jwtUtils.generateToken(user);

            return ResponseEntity.ok(JwtResponse.builder()
                    .token(jwt)
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().name())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        try {
            String idToken = request.get("idToken");
            User user = googleAuthService.verifyGoogleToken(idToken);
            String jwt = jwtUtils.generateToken(user);

            return ResponseEntity.ok(JwtResponse.builder()
                    .token(jwt)
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().name())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Google authentication failed: " + e.getMessage()));
        }
    }
}
