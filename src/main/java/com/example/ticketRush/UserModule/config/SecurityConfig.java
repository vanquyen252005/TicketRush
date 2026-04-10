package com.example.ticketRush.UserModule.config;

import com.example.ticketRush.UserModule.ServiceImpl.CustomOidcUserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final ClientRegistrationRepository clientRegistrationRepository;
    private final CustomOidcUserService oidcUserService;
    private final RoleBasedSuccessHandler roleBasedSuccessHandler;

    public SecurityConfig(ClientRegistrationRepository clientRegistrationRepository, CustomOidcUserService oidcUserService, RoleBasedSuccessHandler roleBasedSuccessHandler) {
        this.clientRegistrationRepository = clientRegistrationRepository;
        this.oidcUserService = oidcUserService;
        this.roleBasedSuccessHandler = roleBasedSuccessHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        OidcClientInitiatedLogoutSuccessHandler handler = new OidcClientInitiatedLogoutSuccessHandler(clientRegistrationRepository);

        handler.setPostLogoutRedirectUri("{baseUrl}/login");

        http
                .authorizeHttpRequests(auth -> auth
                        // Public pages – không cần đăng nhập
                        .requestMatchers(
                                "/login", "/logout", "/error",
                                "/css/**", "/js/**", "/images/**",
                                "/favicon.ico"
                        ).permitAll()
                        // OAuth2 flow
                        .requestMatchers("/oauth2/**").permitAll()
                        // ── Swagger / OpenAPI ──────────────────────────────
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/v3/api-docs.yaml"
                        ).permitAll()
                        // ── Admin area ─────────────────────────────────────
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .formLogin(form -> form
                        .loginPage("/login")
                        .usernameParameter("identifier")
                        .passwordParameter("password")
                        .successHandler(roleBasedSuccessHandler)
                        .failureUrl("/login?error=true")
                )
                .oauth2Login(oauth2->oauth2
                        .loginPage("/login")
                        .userInfoEndpoint(
                                userInfo -> userInfo
                                        .oidcUserService(oidcUserService)
                        )
                        .successHandler(roleBasedSuccessHandler)
                )
                .logout(logout->logout
                        .logoutUrl("/logout")
                        // nếu bạn logout bằng POST từ form thymeleaf thì giữ CSRF ok
                        .logoutSuccessHandler(handler)
                        .clearAuthentication(true)
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID"));
        return http.build();
    }
}
