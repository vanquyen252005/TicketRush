package com.example.ticketRush.UserModule.config;

import com.example.ticketRush.UserModule.ServiceImpl.CustomOidcUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final CustomOidcUserService oidcUserService;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @Value("${app.security.oauth2.enabled:false}")
    private boolean oauth2Enabled;

    public SecurityConfig(
            CorsConfigurationSource corsConfigurationSource,
            @Autowired(required = false) CustomOidcUserService oidcUserService,
            @Autowired(required = false) OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler
    ) {
        this.corsConfigurationSource = corsConfigurationSource;
        this.oidcUserService = oidcUserService;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable());

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/v3/api-docs/**",
                        "/v3/api-docs.yaml",
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/favicon.ico",
                        "/error",
                        "/login"
                ).permitAll()
                .anyRequest().permitAll()
        );

        if (oauth2Enabled && oAuth2LoginSuccessHandler != null && oidcUserService != null) {
            http.sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            );

            http.oauth2Login(oauth2 -> oauth2
                    .loginPage("/login")
                    .userInfoEndpoint(userInfo -> userInfo
                            .oidcUserService(oidcUserService)
                    )
                    .successHandler(oAuth2LoginSuccessHandler)
            );
        }

        return http.build();
    }
}
