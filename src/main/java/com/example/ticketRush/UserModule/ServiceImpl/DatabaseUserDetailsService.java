//package com.example.ticketRush.UserModule.ServiceImpl;
//
//import com.example.ticketRush.UserModule.Entity.User;
//import com.example.ticketRush.UserModule.Repository.UserRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class DatabaseUserDetailsService implements UserDetailsService {
//    private final UserRepository userRepository;
//
//    @Override
//    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
//        User user = userRepository.findByEmailIgnoreCase(identifier)
//                .or(() -> userRepository.findByUsernameIgnoreCase(identifier))
//                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
//
//        if (user.getPassword() == null || user.getPassword().isBlank()) {
//            throw new UsernameNotFoundException("User has no local password (OAuth2 account)");
//        }
//
//        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(user.getRole().name()));
//
//        // Dùng email làm principal mặc định (ổn cho audit/logging)
//        return org.springframework.security.core.userdetails.User
//                .withUsername(user.getEmail())
//                .password(user.getPassword())
//                .authorities(authorities)
//                .disabled(user.getStatus() != null && "DELETED".equalsIgnoreCase(user.getStatus().name()))
//                .build();
//    }
//}
//
