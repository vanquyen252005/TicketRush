package com.example.ticketRush.UserModule.Controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
public class AuthDebugController {

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("authenticated", authentication != null && authentication.isAuthenticated());
        out.put("name", authentication == null ? null : authentication.getName());
        out.put("authorities", authentication == null ? List.of() :
                authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList());
        out.put("authClass", authentication == null ? null : authentication.getClass().getName());
        return out;
    }
}

