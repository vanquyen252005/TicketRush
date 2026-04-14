package com.example.ticketRush.UserModule.config;

import com.example.ticketRush.UserModule.ServiceImpl.CustomOidcUserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
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
                                "/api/auth/refresh"
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
                                "/favicon.ico", "/error"
                        ).permitAll()
                        // Public – Swagger / OpenAPI
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/v3/api-docs.yaml"
                        ).permitAll()
                        // Admin area
                        .requestMatchers("/admin/**").hasRole("ADMIN")
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
                );

        return http.build();
    }
}
