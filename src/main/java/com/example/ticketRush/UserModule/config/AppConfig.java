package com.example.ticketRush.UserModule.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;

@Configuration
public class AppConfig {

    @Value("${spring.security.oauth2.client.provider.ticketRush.issuer-uri}")
    private String issuer;

    @Bean
    public JwtDecoder jwtDecoder() {
        // Dùng issuer-uri của realm Keycloak để tự động lấy metadata/JWKS.
        // JwtDecoder này dùng để verify và decode access token do Keycloak phát hành.
        return JwtDecoders.fromIssuerLocation(issuer);
    }
}
