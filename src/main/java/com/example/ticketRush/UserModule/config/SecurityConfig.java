package com.example.ticketRush.UserModule.config;

import com.example.ticketRush.UserModule.ServiceImpl.CustomOidcUserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Cho phép dùng @PreAuthorize
public class SecurityConfig {

    private final CustomOidcUserService oidcUserService;
    private final CorsConfigurationSource corsConfigurationSource;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public SecurityConfig(
            CustomOidcUserService oidcUserService,
            CorsConfigurationSource corsConfigurationSource,
            OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler
    ) {
        this.oidcUserService = oidcUserService;
        this.corsConfigurationSource = corsConfigurationSource;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // ── CORS ─────────────────────────────────────────────────
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                // ── CSRF: disable cho stateless REST API ─────────────────
                .csrf(csrf -> csrf.disable())

                // OAuth2 authorization code cần session trong request callback
                // để lưu OAuth2AuthorizationRequest / AuthorizedClient; SPA vẫn dùng JWT sau redirect.
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )

                // ── Authorization Rules ──────────────────────────────────
                .authorizeHttpRequests(auth -> auth
                        // Public – Auth endpoints
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/refresh",
                                "/api/admin/users/export",
                                "/api/events",
                                "/api/events/**"
                        ).permitAll()
                        // Public – OAuth2 flow
                        .requestMatchers(
                                "/oauth2/**",
                                "/login/oauth2/**",
                                "/login"
                        ).permitAll()
                        // Public – Static resources
                        .requestMatchers(
                                "/css/**", "/js/**", "/images/**",
                                "/favicon.ico", "/error",
                                "/uploads/**"
                        ).permitAll()
                        // Public – Swagger / OpenAPI
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/v3/api-docs.yaml"
                        ).permitAll()
                        // Admin area API
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        
                        // Tất cả request khác cần xác thực
                        .anyRequest().authenticated()
                )

                // ── OAuth2 Login (Keycloak redirect-based flow) ──────────
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/login")
                        .userInfoEndpoint(userInfo -> userInfo
                                .oidcUserService(oidcUserService)
                        )
                        .successHandler(oAuth2LoginSuccessHandler)
                )

                // ── OAuth2 Resource Server (JWT Bearer Token từ React) ──
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        JwtGrantedAuthoritiesConverter defaultAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            // 1. Lấy các authority mặc định (scope, etc.)
            Collection<GrantedAuthority> authorities = defaultAuthoritiesConverter.convert(jwt);

            // 2. Trích xuất Realm Roles từ JWT của Keycloak
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            if (realmAccess != null && realmAccess.get("roles") instanceof List) {
                List<String> roles = (List<String>) realmAccess.get("roles");

                Collection<GrantedAuthority> realmRoles = roles.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                        .collect(Collectors.toList());

                // Gộp chung lại
                return Stream.concat(authorities.stream(), realmRoles.stream())
                        .collect(Collectors.toList());
            }

            return authorities;
        });

        return converter;
    }
}
