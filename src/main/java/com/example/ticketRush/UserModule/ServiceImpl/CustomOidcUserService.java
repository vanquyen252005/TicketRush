package com.example.ticketRush.UserModule.ServiceImpl;

import com.example.ticketRush.UserModule.Enum.Role;
import com.example.ticketRush.UserModule.Service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CustomOidcUserService extends OidcUserService {
    private static final Logger logger = LoggerFactory.getLogger(CustomOidcUserService.class);

    private final JwtDecoder jwtDecoder;
    private final UserService userService;

    @Value("${spring.security.oauth2.client.registration.ticketRush.client-id}")
    private String clientId;

    public CustomOidcUserService(JwtDecoder jwtDecoder, UserService userService) {
        this.jwtDecoder = jwtDecoder;
        this.userService = userService;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        // B1: để Spring lấy OIDC user mặc định từ Keycloak trước.
        OidcUser defaultUser = super.loadUser(userRequest);

        // B2: lấy access token để đọc thêm roles trong claims của Keycloak.
        String accessToken = userRequest.getAccessToken().getTokenValue();

        // B3: chuyển roles của Keycloak thành GrantedAuthority cho Spring Security.
        Set<GrantedAuthority> keycloakRoles = extractKeycloakRoles(accessToken);
        keycloakRoles.addAll(defaultUser.getAuthorities());

        try {
            String username = defaultUser.getPreferredUsername() != null
                    ? defaultUser.getPreferredUsername()
                    : defaultUser.getEmail();
            String email = defaultUser.getEmail();
            String fullname = defaultUser.getFullName() != null
                    ? defaultUser.getFullName()
                    : defaultUser.getName();

            // Map roles trong token Keycloak sang enum Role nội bộ.
            Role role = determineRoleFromAuthorities(keycloakRoles);

            // Đồng bộ user Keycloak vào DB local để các module nghiệp vụ vẫn dùng User entity nội bộ.
            userService.findOrCreateUserFromKeycloak(defaultUser.getSubject(), username, email, fullname, role);
            logger.info("Đã xử lý user từ Keycloak với email: {}", email);
        } catch (Exception e) {
            logger.error("Lỗi khi xử lý user từ Keycloak: {}", e.getMessage(), e);
            // Không throw để tránh làm gián đoạn toàn bộ login flow.
        }

        return new DefaultOidcUser(
                keycloakRoles,
                defaultUser.getIdToken(),
                defaultUser.getUserInfo()
        );
    }

    private Set<GrantedAuthority> extractKeycloakRoles(String accessToken) {
        // Decode access token của Keycloak để đọc claims role.
        Jwt jwt = jwtDecoder.decode(accessToken);

        Set<String> roles = new HashSet<>();

        // Realm roles: role gán ở cấp realm trong Keycloak.
        @SuppressWarnings("unchecked")
        Map<String, Object> realmAccess = (Map<String, Object>) jwt.getClaim("realm_access");
        if (realmAccess != null) {
            @SuppressWarnings("unchecked")
            List<String> realmRoles = (List<String>) realmAccess.get("roles");
            if (realmRoles != null) {
                roles.addAll(realmRoles);
            }
        }

        // Client roles: role gán riêng cho client "ticketRush" trong Keycloak.
        @SuppressWarnings("unchecked")
        Map<String, Object> resourceAccess = (Map<String, Object>) jwt.getClaim("resource_access");
        if (resourceAccess != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> clientResource = (Map<String, Object>) resourceAccess.get(clientId);
            if (clientResource != null) {
                @SuppressWarnings("unchecked")
                List<String> clientRoles = (List<String>) clientResource.get("roles");
                if (clientRoles != null) {
                    roles.addAll(clientRoles);
                }
            }
        }

        if (roles.isEmpty()) {
            return Collections.emptySet();
        }

        // Chuẩn hóa về ROLE_* để hasRole()/hasAuthority() của Spring Security dùng thống nhất.
        return roles.stream()
                .map(String::trim)
                .filter(r -> !r.isBlank())
                .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                .map(String::toUpperCase)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());
    }

    private Role determineRoleFromAuthorities(Set<GrantedAuthority> authorities) {
        // Nếu token Keycloak có ADMIN thì ưu tiên ADMIN, còn lại fallback về USER.
        for (GrantedAuthority authority : authorities) {
            if ("ROLE_ADMIN".equals(authority.getAuthority())) {
                return Role.ROLE_ADMIN;
            }
        }
        return Role.ROLE_USER;
    }
}
