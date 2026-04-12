//package com.example.ticketRush.UserModule.config;
//
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
//import org.springframework.stereotype.Component;
//
//import java.io.IOException;
//import java.util.Set;
//import java.util.stream.Collectors;
//
//@Component
//public class RoleBasedSuccessHandler implements AuthenticationSuccessHandler {
//    @Override
//    public void onAuthenticationSuccess(
//            HttpServletRequest request,
//            HttpServletResponse response,
//            Authentication authentication
//    ) throws IOException, ServletException {
//
//        Set<String> authorities = authentication.getAuthorities().stream()
//                .map(GrantedAuthority::getAuthority)
//                .collect(Collectors.toSet());
//
//        // Lưu ý: với Spring, role thường có prefix "ROLE_"
//        if (authorities.contains("ROLE_ADMIN")) {
//            response.sendRedirect("/admin/home");
//            return;
//        }
//        // default
//        response.sendRedirect("/");
//    }
//}
