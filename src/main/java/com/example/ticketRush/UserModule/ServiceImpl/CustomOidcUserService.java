//package com.example.ticketRush.UserModule.ServiceImpl;
//
//import com.example.ticketRush.UserModule.Enum.Role;
//import com.example.ticketRush.UserModule.Service.UserService;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
//import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
//import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
//import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
//import org.springframework.security.oauth2.core.oidc.user.OidcUser;
//import org.springframework.security.oauth2.jwt.Jwt;
//import org.springframework.security.oauth2.jwt.JwtDecoder;
//import org.springframework.stereotype.Service;
//
//import java.util.Collections;
//import java.util.HashSet;
//import java.util.List;
//import java.util.Map;
//import java.util.Set;
//import java.util.stream.Collectors;
//
//@Service
//public class CustomOidcUserService extends OidcUserService {
//    private static final Logger logger = LoggerFactory.getLogger(CustomOidcUserService.class);
//
//    private final JwtDecoder jwtDecoder;
//    private final UserService userService;
//
//    @Value("${spring.security.oauth2.client.registration.ticketRush.client-id}")
//    private String clientId;
//
//    public CustomOidcUserService(JwtDecoder jwtDecoder, UserService userService) {
//        this.jwtDecoder = jwtDecoder;
//        this.userService = userService;
//    }
//
//    @Override
//    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
//        OidcUser defaultUser =  super.loadUser(userRequest);
//
//        // Get the access token
//        String accessToken = userRequest.getAccessToken().getTokenValue();
//
//        // Extract the role
//        Set<GrantedAuthority> keycloakRoles = extractKeycloakRoles(accessToken);
//        keycloakRoles.addAll(defaultUser.getAuthorities());
//
//        // Kiểm tra và tạo user trong database nếu chưa tồn tại
//        try {
//            String username = defaultUser.getPreferredUsername() != null
//                    ? defaultUser.getPreferredUsername()
//                    : defaultUser.getEmail();
//            String email = defaultUser.getEmail();
//            String fullname = defaultUser.getFullName() != null
//                    ? defaultUser.getFullName()
//                    : defaultUser.getName();
//            // Xác định role từ Keycloak roles
//            Role role = determineRoleFromAuthorities(keycloakRoles);
//
//            // Kiểm tra và tạo user nếu chưa tồn tại
//            userService.findOrCreateUserFromKeycloak(defaultUser.getSubject(), username, email, fullname, role);
//            logger.info("Đã xử lý user từ Keycloak với email: {}", email);
//        } catch (Exception e) {
//            logger.error("Lỗi khi xử lý user từ Keycloak: {}", e.getMessage(), e);
//            // Không throw exception để không làm gián đoạn quá trình đăng nhập
//        }
//
//        return new DefaultOidcUser(
//                keycloakRoles,
//                defaultUser.getIdToken(),
//                defaultUser.getUserInfo()
//        );
//
//
//    }
//
//    private Set<GrantedAuthority> extractKeycloakRoles(String accessToken) {
//        // Decode the access token
//        Jwt jwt = jwtDecoder.decode(accessToken);
//
//        Set<String> roles = new HashSet<>();
//
//        // 1) Realm roles: realm_access.roles (phù hợp với bạn đang tạo realm_role)
//        @SuppressWarnings("unchecked")
//        Map<String, Object> realmAccess = (Map<String, Object>) jwt.getClaim("realm_access");
//        if (realmAccess != null) {
//            @SuppressWarnings("unchecked")
//            List<String> realmRoles = (List<String>) realmAccess.get("roles");
//            if (realmRoles != null) {
//                roles.addAll(realmRoles);
//            }
//        }
//
//        // 2) Client roles: resource_access[clientId].roles (giữ lại cho trường hợp bạn dùng client role)
//        @SuppressWarnings("unchecked")
//        Map<String, Object> resourceAccess = (Map<String, Object>) jwt.getClaim("resource_access");
//        if (resourceAccess != null) {
//            @SuppressWarnings("unchecked")
//            Map<String, Object> clientResource = (Map<String, Object>) resourceAccess.get(clientId);
//            if (clientResource != null) {
//                @SuppressWarnings("unchecked")
//                List<String> clientRoles = (List<String>) clientResource.get("roles");
//                if (clientRoles != null) {
//                    roles.addAll(clientRoles);
//                }
//            }
//        }
//
//        if (roles.isEmpty()) {
//            return Collections.emptySet();
//        }
//
//        // Normalize tránh ROLE_ROLE_ADMIN nếu Keycloak đã đặt tên role là ROLE_ADMIN
//        return roles.stream()
//                .map(String::trim)
//                .filter(r -> !r.isBlank())
//                .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
//                .map(String::toUpperCase)
//                .map(SimpleGrantedAuthority::new)
//                .collect(Collectors.toSet());
//
//    }
//
//    private Role determineRoleFromAuthorities(Set<GrantedAuthority> authorities) {
//        // Ưu tiên ADMIN, còn lại mặc định USER
//        for (GrantedAuthority authority : authorities) {
//            if ("ROLE_ADMIN".equals(authority.getAuthority())) {
//                return Role.ROLE_ADMIN;
//            }
//        }
//        return Role.ROLE_USER;
//    }
//}
