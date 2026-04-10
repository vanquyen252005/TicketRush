package com.example.ticketRush.UserModule.Service;

import com.example.ticketRush.UserModule.Dto.UserRegisterRequest;
import com.example.ticketRush.UserModule.Entity.User;

public interface UserService {
    User registerUser(UserRegisterRequest request);
}
