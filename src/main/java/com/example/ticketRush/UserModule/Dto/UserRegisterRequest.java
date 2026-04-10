package com.example.ticketRush.UserModule.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserRegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String phoneNumber;
}
