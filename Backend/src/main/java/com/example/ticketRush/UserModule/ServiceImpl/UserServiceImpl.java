package com.example.ticketRush.UserModule.ServiceImpl;

import com.example.ticketRush.UserModule.Dto.Response.UserResponse;
import com.example.ticketRush.UserModule.Entity.User;
import com.example.ticketRush.UserModule.Repository.UserRepository;
import com.example.ticketRush.UserModule.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
//    private final PasswordEncoder passwordEncoder;
//    private final JwtUtil jwtUtil;
//    private final AuthenticationManager authenticationManager;

//    @Override
//    public AuthResponse register(RegisterRequest request) {
//        if (userRepository.existsByEmail(request.email())) {
//            throw new UserAlreadyExistsException("Email already in use");
//        }
//
//        User user = User.builder()
//                .email(request.email())
//                .password(passwordEncoder.encode(request.password()))
//                .fullName(request.fullName())
//                .phoneNumber(request.phoneNumber())
//                .role(Role.ROLE_USER)
//                .status(UserStatus.ACTIVE)
//                .build();
//
//        userRepository.save(user);
//
//        String jwtToken = jwtUtil.generateToken(user.getEmail());
//        return new AuthResponse(jwtToken, mapToUserResponse(user));
//    }

//    @Override
//    public AuthResponse login(LoginRequest request) {
//        // Spring Security sẽ tự động throw BadCredentialsException nếu sai pass
//        authenticationManager.authenticate(
//                new UsernamePasswordAuthenticationToken(request.email(), request.password())
//        );
//
//        User user = userRepository.findByEmailAndStatusNot(request.email(), UserStatus.DELETED)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        String jwtToken = jwtUtil.generateToken(user.getEmail());
//        return new AuthResponse(jwtToken, mapToUserResponse(user));
//    }

    // ... Implement getProfile() và updateProfile() ...

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getPhoneNumber(), user.getRole().name());
    }
}
