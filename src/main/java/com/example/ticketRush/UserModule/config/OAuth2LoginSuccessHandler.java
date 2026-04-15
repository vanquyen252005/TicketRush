package com.example.ticketRush.UserModule.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Handler chạy sau khi Keycloak login thành công.
 *
 * Mục tiêu:
 * - lấy access token / refresh token của phiên OAuth2 hiện tại
 * - redirect về frontend SPA để FE tự lưu token và gọi API tiếp
 */
@Component
@ConditionalOnProperty(prefix = "app.security.oauth2", name = "enabled", havingValue = "true")
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);

    private final OAuth2AuthorizedClientService authorizedClientService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public OAuth2LoginSuccessHandler(OAuth2AuthorizedClientService authorizedClientService) {
        this.authorizedClientService = authorizedClientService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            // registrationId ở đây sẽ là "ticketRush" và dùng để load đúng authorized client.
            String clientRegistrationId = oauthToken.getAuthorizedClientRegistrationId();

            OAuth2AuthorizedClient authorizedClient = authorizedClientService.loadAuthorizedClient(
                    clientRegistrationId,
                    oauthToken.getName()
            );

            if (authorizedClient != null && authorizedClient.getAccessToken() != null) {
                // Đây là token Spring vừa đổi được từ Keycloak sau authorization code flow.
                String accessToken = authorizedClient.getAccessToken().getTokenValue();
                String refreshToken = authorizedClient.getRefreshToken() != null
                        ? authorizedClient.getRefreshToken().getTokenValue()
                        : "";

                // Redirect token về FE để SPA tự lưu và gắn vào các request API sau đó.
                String redirectUrl = frontendUrl + "/oauth2/callback"
                        + "?token=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8)
                        + "&refreshToken=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8);

                logger.info("OAuth2 login thành công, redirect về FE: {}", frontendUrl + "/oauth2/callback");
                response.sendRedirect(redirectUrl);
                return;
            }
        }

        logger.warn("Không thể lấy OAuth2 token, redirect về FE login");
        response.sendRedirect(frontendUrl + "/login?error=oauth2_failed");
    }
}
