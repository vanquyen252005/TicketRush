package com.example.ticketRush.UserModule.ServiceImpl;

import com.example.ticketRush.UserModule.Dto.UserRegisterRequest;
import com.example.ticketRush.UserModule.Entity.User;
import com.example.ticketRush.UserModule.Enum.Role;
import com.example.ticketRush.UserModule.Enum.UserStatus;
import com.example.ticketRush.UserModule.Repository.UserRepository;
import com.example.ticketRush.UserModule.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User registerUser(UserRegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .role(Role.ROLE_USER)
                .status(UserStatus.ACTIVE)
                .build();

        return userRepository.save(user);
    }
}
